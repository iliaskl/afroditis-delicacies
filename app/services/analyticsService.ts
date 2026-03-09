// app/services/analyticsService.ts
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Order, OrderStatus } from "../types/types";

export interface AnalyticsData {
  revenueThisMonth: number;
  ordersThisMonth: number;
  ordersLastMonth: number;
  averageOrderValue: number;
  statusBreakdown: Record<OrderStatus, number>;
  topDishes: Array<{ name: string; count: number }>;
  busiestDays: Array<{ day: string; count: number }>;
}

function docToOrder(id: string, data: any): Order {
  return {
    id,
    orderCode: data.orderCode ?? "",
    userId: data.userId ?? "",
    customerName: data.customerName ?? "",
    customerEmail: data.customerEmail ?? "",
    customerPhone: data.customerPhone ?? "",
    items: data.items ?? [],
    subtotal: data.subtotal ?? 0,
    status: data.status ?? "pending",
    paymentMethod: data.paymentMethod ?? "pay_on_delivery",
    paymentStatus: data.paymentStatus ?? "pending_payment",
    deliveryAddress: data.deliveryAddress ?? {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      fullAddress: "",
    },
    deliveryDate: data.deliveryDate?.toDate?.() ?? new Date(data.deliveryDate),
    deliveryTime: data.deliveryTime ?? "",
    orderDate: data.orderDate?.toDate?.() ?? new Date(data.orderDate),
    adminNotes: data.adminNotes,
    isNewForAdmin: data.isNewForAdmin ?? false,
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(data.updatedAt),
  };
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const snap = await getDocs(collection(db, "orders"));
  const orders: Order[] = snap.docs.map((d) => docToOrder(d.id, d.data()));

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
  );

  const thisMonthOrders = orders.filter((o) => o.orderDate >= thisMonthStart);
  const lastMonthOrders = orders.filter(
    (o) => o.orderDate >= lastMonthStart && o.orderDate <= lastMonthEnd,
  );

  // Revenue: only count delivered + active orders this month
  const revenueThisMonth = thisMonthOrders
    .filter((o) => o.status === "delivered" || o.status === "active")
    .reduce((sum, o) => sum + (o.subtotal ?? 0), 0);

  // Average order value across all non-declined orders
  const validOrders = orders.filter((o) => o.status !== "declined");
  const averageOrderValue =
    validOrders.length > 0
      ? validOrders.reduce((sum, o) => sum + (o.subtotal ?? 0), 0) /
        validOrders.length
      : 0;

  // Status breakdown across all orders
  const statusBreakdown: Record<OrderStatus, number> = {
    pending: 0,
    active: 0,
    declined: 0,
    delivered: 0,
  };
  for (const o of orders) {
    if (o.status in statusBreakdown) {
      statusBreakdown[o.status]++;
    }
  }

  // Top dishes: count total quantity sold across all delivered/active orders
  const dishCounts: Record<string, number> = {};
  for (const o of orders) {
    if (o.status === "delivered" || o.status === "active") {
      for (const item of o.items ?? []) {
        const name = item.dishName;
        const qty = (item.quantities ?? []).reduce(
          (s: number, q: any) => s + (q.quantity ?? 0),
          0,
        );
        dishCounts[name] = (dishCounts[name] ?? 0) + qty;
      }
    }
  }
  const topDishes = Object.entries(dishCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Busiest delivery days (day of week) across all delivered/active orders
  const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayCounts: Record<string, number> = {};
  for (const o of orders) {
    if (o.status === "delivered" || o.status === "active") {
      const dayName = DAY_NAMES[new Date(o.deliveryDate).getDay()];
      dayCounts[dayName] = (dayCounts[dayName] ?? 0) + 1;
    }
  }
  const busiestDays = Object.entries(dayCounts)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    revenueThisMonth,
    ordersThisMonth: thisMonthOrders.length,
    ordersLastMonth: lastMonthOrders.length,
    averageOrderValue,
    statusBreakdown,
    topDishes,
    busiestDays,
  };
}
