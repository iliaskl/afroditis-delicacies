// app/routes/orders.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Header from "../components/utils/header";
import Footer from "../components/utils/footer";
import { useAuth } from "../context/authContext/authContext";
import { useUserProfile } from "../context/userContext/userProfile";
import {
  subscribeToAllOrders,
  approveOrder,
  declineOrder,
  markOrderDelivered,
} from "../services/orderService";
import { emailService } from "../services/emailService";
import type { Order } from "../types/types";
import OrderSection from "../components/orders/OrderSection";
import ConfirmDialog from "../components/orders/ConfirmDialog";
import "../styles/orders.css";

const PAGE_SIZE = 5;

function deliveryDateTime(order: Order): number {
  return new Date(
    `${new Date(order.deliveryDate).toDateString()} ${order.deliveryTime}`,
  ).getTime();
}

export default function Orders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const profile = useUserProfile();
  const isAdmin = user && profile?.role === "admin";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<{
    type: "approve" | "decline" | "deliver" | "scrap";
    order: Order;
  } | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [newPage, setNewPage] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [inactivePage, setInactivePage] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate("/");
      return;
    }
    const unsubscribe = subscribeToAllOrders((all) => {
      setOrders(all);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isAdmin, authLoading, navigate]);

  const newOrders = orders
    .filter((o) => o.status === "pending")
    .sort((a, b) => deliveryDateTime(a) - deliveryDateTime(b));

  const activeOrders = orders
    .filter((o) => o.status === "active")
    .sort((a, b) => deliveryDateTime(a) - deliveryDateTime(b));

  const inactiveOrders = orders
    .filter((o) => o.status === "delivered" || o.status === "declined")
    .sort((a, b) => deliveryDateTime(b) - deliveryDateTime(a));

  const clampedNewPage = Math.min(
    newPage,
    Math.max(0, Math.ceil(newOrders.length / PAGE_SIZE) - 1),
  );
  const clampedActivePage = Math.min(
    activePage,
    Math.max(0, Math.ceil(activeOrders.length / PAGE_SIZE) - 1),
  );
  const clampedInactivePage = Math.min(
    inactivePage,
    Math.max(0, Math.ceil(inactiveOrders.length / PAGE_SIZE) - 1),
  );

  const pagedNewOrders = newOrders.slice(
    clampedNewPage * PAGE_SIZE,
    (clampedNewPage + 1) * PAGE_SIZE,
  );
  const pagedActiveOrders = activeOrders.slice(
    clampedActivePage * PAGE_SIZE,
    (clampedActivePage + 1) * PAGE_SIZE,
  );
  const pagedInactiveOrders = inactiveOrders.slice(
    clampedInactivePage * PAGE_SIZE,
    (clampedInactivePage + 1) * PAGE_SIZE,
  );

  const handleApprove = (order: Order) => {
    setConfirmState({ type: "approve", order });
  };

  const handleDecline = (order: Order) => {
    setDeclineNote("");
    setConfirmState({ type: "decline", order });
  };

  const handleDeliver = (order: Order) => {
    setConfirmState({ type: "deliver", order });
  };

  const handleScrap = (order: Order) => {
    setConfirmState({ type: "scrap", order });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    setActionLoading(true);
    try {
      const { type, order } = confirmState;
      if (type === "approve") {
        await approveOrder(order.id);
        const { getOrderById } = await import("../services/orderService");
        const updatedOrder = await getOrderById(order.id);
        if (updatedOrder) {
          await emailService.sendOrderApprovedToCustomer(updatedOrder);
        }
      } else if (type === "decline") {
        await declineOrder(order.id, declineNote.trim() || undefined);
        const { getOrderById } = await import("../services/orderService");
        const updatedOrder = await getOrderById(order.id);
        if (updatedOrder) {
          await emailService.sendOrderDeclinedToCustomer(
            updatedOrder,
            declineNote.trim() || undefined,
          );
        }
      } else if (type === "deliver") {
        await markOrderDelivered(order.id);
      } else if (type === "scrap") {
        await declineOrder(order.id, declineNote.trim() || undefined);
        const { getOrderById } = await import("../services/orderService");
        const updatedOrder = await getOrderById(order.id);
        if (updatedOrder) {
          await emailService.sendOrderScrappedToCustomer(
            updatedOrder,
            declineNote.trim() || undefined,
          );
        }
      }
    } catch (error) {
      console.error("Action failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
      setConfirmState(null);
      setDeclineNote("");
    }
  };

  const handleCancelConfirm = () => {
    if (actionLoading) return;
    setConfirmState(null);
    setDeclineNote("");
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1 className="orders-title">Orders</h1>
          </div>

          {loading ? (
            <div className="orders-loading">
              <svg className="orders-spinner" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
              <p>Loading orders…</p>
            </div>
          ) : (
            <div className="orders-sections">
              <OrderSection
                title="New Orders"
                orders={pagedNewOrders}
                totalOrders={newOrders}
                emptyMessage="No new orders waiting for review."
                onApprove={handleApprove}
                onDecline={handleDecline}
                onDeliver={handleDeliver}
                onScrap={handleScrap}
                showApproveDecline={true}
                accentColor="#d9a84e"
                hidden={newOrders.length === 0}
                page={clampedNewPage}
                pageSize={PAGE_SIZE}
                onPageChange={setNewPage}
              />
              <OrderSection
                title="Active Orders"
                orders={pagedActiveOrders}
                totalOrders={activeOrders}
                emptyMessage="No active orders in progress."
                onApprove={handleApprove}
                onDecline={handleDecline}
                onDeliver={handleDeliver}
                onScrap={handleScrap}
                showDeliverButton={true}
                accentColor="#6b7e3f"
                page={clampedActivePage}
                pageSize={PAGE_SIZE}
                onPageChange={setActivePage}
              />
              <OrderSection
                title="Inactive Orders"
                orders={pagedInactiveOrders}
                totalOrders={inactiveOrders}
                emptyMessage="No completed or declined orders yet."
                onApprove={handleApprove}
                onDecline={handleDecline}
                onDeliver={handleDeliver}
                onScrap={handleScrap}
                accentColor="#8a8a7a"
                page={clampedInactivePage}
                pageSize={PAGE_SIZE}
                onPageChange={setInactivePage}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />

      {confirmState?.type === "approve" && (
        <ConfirmDialog
          message={`Approve order ${confirmState.order.orderCode} for ${confirmState.order.customerName}?`}
          confirmLabel={actionLoading ? "Approving…" : "Yes, Approve"}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />
      )}
      {confirmState?.type === "decline" && (
        <ConfirmDialog
          message={`Decline order ${confirmState.order.orderCode} for ${confirmState.order.customerName}?`}
          confirmLabel={actionLoading ? "Declining…" : "Yes, Decline"}
          confirmDanger={true}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
          extraContent={
            <div className="decline-note-wrapper">
              <label className="decline-note-label">
                Reason / note for customer (optional):
              </label>
              <textarea
                className="decline-note-input"
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="e.g. Unavailable on that date, please choose another day."
                rows={3}
              />
            </div>
          }
        />
      )}
      {confirmState?.type === "deliver" && (
        <ConfirmDialog
          message={`Mark order ${confirmState.order.orderCode} as delivered?`}
          confirmLabel={actionLoading ? "Saving…" : "Yes, Mark Delivered"}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />
      )}
      {confirmState?.type === "scrap" && (
        <ConfirmDialog
          message={`Scrap order ${confirmState.order.orderCode} for ${confirmState.order.customerName}? This will cancel the order and free up the time slot.`}
          confirmLabel={actionLoading ? "Scrapping…" : "Yes, Scrap Order"}
          confirmDanger={true}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
          extraContent={
            <div className="decline-note-wrapper">
              <label className="decline-note-label">
                Reason / note for customer (optional):
              </label>
              <textarea
                className="decline-note-input"
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
                placeholder="e.g. Unable to fulfill this order, sorry for the inconvenience."
                rows={3}
              />
            </div>
          }
        />
      )}
    </div>
  );
}
