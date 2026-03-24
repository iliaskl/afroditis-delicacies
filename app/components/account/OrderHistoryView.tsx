// app/components/account/OrderHistoryView.tsx
import { useState } from "react";
import type { Order } from "../../types/types";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  active: "Approved",
  declined: "Declined",
  delivered: "Delivered",
};

const ORDER_STATUS_CLASS: Record<string, string> = {
  pending: "order-history-status-pending",
  active: "order-history-status-active",
  declined: "order-history-status-declined",
  delivered: "order-history-status-delivered",
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  pay_on_delivery: "Cash or Check on Delivery",
  venmo: "Venmo",
  paypal: "PayPal",
};

interface OrderHistoryViewProps {
  orderHistory: Order[];
  ordersLoading: boolean;
}

const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orderHistory,
  ordersLoading,
}) => {
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);

  if (ordersLoading) return <p className="empty-state">Loading...</p>;

  if (orderHistory.length === 0) {
    return (
      <div className="order-history-view">
        <p className="empty-state">You haven't placed any orders yet.</p>
        <p className="empty-state-hint">
          Browse our menu and place your first order!
        </p>
      </div>
    );
  }

  return (
    <div className="order-history-view">
      {ordersLoading ? (
        <p className="empty-state">Loading your orders...</p>
      ) : orderHistory.length === 0 ? (
        <>
          <p className="empty-state">No orders yet.</p>
          <p className="empty-state-hint">
            Place your first order to see your order history here!
          </p>
        </>
      ) : (
        <div className="order-history-list">
          {orderHistory.map((order) => {
            const statusLabel =
              ORDER_STATUS_LABEL[order.status] ?? order.status;
            const statusClass = ORDER_STATUS_CLASS[order.status] ?? "";
            const itemCount = order.items.reduce(
              (sum, item) =>
                sum + item.quantities.reduce((s, q) => s + q.quantity, 0),
              0,
            );
            return (
              <div key={order.id} className="order-history-card">
                <div className="order-history-card-header">
                  <span className="order-history-code">{order.orderCode}</span>
                  <span className={`order-history-status ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="order-history-card-body">
                  <p className="order-history-date">
                    Placed:{" "}
                    {new Date(order.orderDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="order-history-delivery">
                    Delivery:{" "}
                    {new Date(order.deliveryDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at {order.deliveryTime}
                  </p>
                  <p className="order-history-item-summary">
                    {itemCount} item{itemCount !== 1 ? "s" : ""}:{" "}
                    {order.items.map((i) => i.dishName).join(", ")}
                  </p>
                  <div className="order-history-footer">
                    <span className="order-history-total">
                      ${order.subtotal.toFixed(2)}
                    </span>
                    <button
                      className="order-history-details-btn"
                      onClick={() => setExpandedOrder(order)}
                    >
                      View Details
                    </button>
                  </div>
                  {order.status === "declined" && order.adminNotes && (
                    <p className="order-history-decline-note">
                      Reason: {order.adminNotes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {expandedOrder && (
        <div
          className="order-detail-overlay"
          onClick={() => setExpandedOrder(null)}
        >
          <div
            className="order-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-detail-modal-header">
              <div className="order-detail-title-row">
                <h3 className="order-detail-code">{expandedOrder.orderCode}</h3>
                <span
                  className={`order-history-status ${ORDER_STATUS_CLASS[expandedOrder.status] ?? ""}`}
                >
                  {ORDER_STATUS_LABEL[expandedOrder.status] ??
                    expandedOrder.status}
                </span>
              </div>
              <button
                className="order-detail-close"
                onClick={() => setExpandedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="order-detail-body">
              <div className="order-detail-section">
                <h4 className="order-detail-section-title">Order Info</h4>
                <div className="order-detail-row">
                  <span className="order-detail-label">Order Placed</span>
                  <span className="order-detail-value">
                    {new Date(expandedOrder.orderDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
                <div className="order-detail-row">
                  <span className="order-detail-label">Delivery Time</span>
                  <span className="order-detail-value">
                    {new Date(expandedOrder.deliveryDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}{" "}
                    at {expandedOrder.deliveryTime}
                  </span>
                </div>
                <div className="order-detail-row">
                  <span className="order-detail-label">Address</span>
                  <span className="order-detail-value">
                    {expandedOrder.deliveryAddress.fullAddress ||
                    [
                      expandedOrder.deliveryAddress.street,
                      expandedOrder.deliveryAddress.city,
                      expandedOrder.deliveryAddress.state,
                      expandedOrder.deliveryAddress.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
                <div className="order-detail-row">
                  <span className="order-detail-label">Payment Method</span>
                  <span className="order-detail-value">
                    {PAYMENT_METHOD_LABEL[expandedOrder.paymentMethod] ??
                      expandedOrder.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="order-detail-section">
                <h4 className="order-detail-section-title">Items Ordered</h4>
                <div className="order-detail-items">
                  {expandedOrder.items.map((item, i) => (
                    <div key={i} className="order-detail-item">
                      <div className="order-detail-item-header">
                        <span className="order-detail-item-name">
                          {item.dishName}
                        </span>
                        <span className="order-detail-item-subtotal">
                          ${item.itemSubtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="order-detail-item-quantities">
                        {item.quantities.map((q) => (
                          <span key={q.size} className="order-detail-qty-pill">
                            {q.size.charAt(0).toUpperCase() + q.size.slice(1)} ×{" "}
                            {q.quantity} — ${(q.price * q.quantity).toFixed(2)}
                          </span>
                        ))}
                      </div>
                      {item.specialInstructions && (
                        <p className="order-detail-item-note">
                          {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>          

              <div className="order-detail-total-row">
                <span className="order-detail-total-label">Order Total</span>
                <span className="order-detail-total-value">
                  ${expandedOrder.subtotal.toFixed(2)}
                </span>
              </div>

              {expandedOrder.status === "declined" &&
                expandedOrder.adminNotes && (
                  <div className="order-detail-decline-box">
                    <p className="order-detail-decline-title">Order Declined</p>
                    <p className="order-detail-decline-reason">
                      {expandedOrder.adminNotes}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryView;
