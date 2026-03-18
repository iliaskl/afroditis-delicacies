// app/components/orders/OrderSection.tsx
import OrderRow from "./OrderRow";
import type { Order } from "../../types/types";

interface OrderSectionProps {
  title: string;
  orders: Order[];
  totalOrders: Order[];
  emptyMessage: string;
  onApprove: (order: Order) => void;
  onDecline: (order: Order) => void;
  onDeliver: (order: Order) => void;
  onScrap: (order: Order) => void;
  showDeliverButton?: boolean;
  showApproveDecline?: boolean;
  accentColor?: string;
  hidden?: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function OrderSection({
  title,
  orders,
  totalOrders,
  emptyMessage,
  onApprove,
  onDecline,
  onDeliver,
  onScrap,
  showDeliverButton = false,
  showApproveDecline = false,
  accentColor = "#6b7e3f",
  hidden = false,
  page,
  pageSize,
  onPageChange,
}: OrderSectionProps) {
  if (hidden) return null;

  const totalPages = Math.ceil(totalOrders.length / pageSize);

  return (
    <section className="orders-section">
      <div
        className="orders-section-header"
        style={{ borderLeftColor: accentColor }}
      >
        <h2 className="orders-section-title">{title}</h2>
        <span className="orders-section-count">{totalOrders.length}</span>
      </div>

      {totalOrders.length === 0 ? (
        <p className="orders-empty">{emptyMessage}</p>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onApprove={onApprove}
                onDecline={onDecline}
                onDeliver={onDeliver}
                onScrap={onScrap}
                showDeliverButton={showDeliverButton}
                showApproveDecline={showApproveDecline}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="orders-pagination">
              <button
                className="pagination-btn"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
              >
                ← Newer
              </button>
              <span className="pagination-info">
                {page + 1} / {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Older →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
