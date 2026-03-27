import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../../context/cartContext/cartContext";
import { useAuth } from "../../context/authContext/authContext";
import { getMenuData } from "../../services/menuService";
import "../../styles/cartPopup.css";

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPopup = ({ isOpen, onClose }: CartPopupProps) => {
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeItem,
    clearCart,
    loading,
  } = useCart();
  const { user, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(new Set());
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const isGoogleUser = user?.providerData.some(
    (p) => p.providerId === "google.com",
  );
  const isUnverified = !!user && !isGoogleUser && !user.emailVerified;

  useEffect(() => {
    if (!isOpen) {
      setUnavailableIds(new Set());
      setAvailabilityChecked(false);
      setVerifyMessage(null);
      return;
    }
    if (cartItems.length === 0) {
      setAvailabilityChecked(true);
      return;
    }
    getMenuData()
      .then(({ items }) => {
        const unavailable = new Set<string>();
        cartItems.forEach((cartItem) => {
          const menuItem = items.find((i) => i.id === cartItem.menuItemId);
          if (menuItem && !menuItem.available)
            unavailable.add(cartItem.menuItemId);
        });
        setUnavailableIds(unavailable);
      })
      .catch((err) => console.error("Failed to check availability:", err))
      .finally(() => setAvailabilityChecked(true));
  }, [isOpen, cartItems]);

  const hasUnavailable = unavailableIds.size > 0;

  const handleUpdateQuantity = async (
    itemId: string,
    size: string,
    newQuantity: number,
  ) => {
    try {
      await updateQuantity(itemId, size, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      alert("Failed to clear cart. Please try again.");
    }
  };

  const handleProceedToCheckout = () => {
    onClose();
    document.body.classList.remove("modal-open");
    navigate("/checkout");
  };

  const handleSendVerification = async () => {
    setVerifyLoading(true);
    setVerifyMessage(null);
    try {
      await sendVerificationEmail();
      setVerifyMessage("Verification email sent! Check your inbox.");
    } catch (err: any) {
      setVerifyMessage(err.message || "Failed to send verification email.");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-popup" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2 className="cart-title">Your Cart</h2>
          <button
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cart-content">
          {loading || !availabilityChecked ? (
            <div className="cart-loading">
              <svg className="spinner" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
              <p>Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <svg
                className="empty-cart-icon"
                viewBox="0 0 24 24"
                width="64"
                height="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <h3>Your cart is empty</h3>
              <p>Add some delicious Greek dishes to get started!</p>
              <button
                className="browse-menu-btn"
                onClick={() => {
                  onClose();
                  navigate("/menu");
                }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              <button
                className="clear-cart-btn"
                onClick={handleClearCart}
                disabled={loading}
              >
                Clear Cart
              </button>

              {hasUnavailable && (
                <div className="cart-unavailable-notice">
                  Some items are no longer available. Please remove them to
                  proceed to checkout.
                </div>
              )}

              <div className="cart-items">
                {cartItems.map((item) => {
                  const isUnavailable = unavailableIds.has(item.menuItemId);
                  return (
                    <div
                      key={item.id}
                      className={`cart-item${isUnavailable ? " cart-item-unavailable" : ""}`}
                    >
                      <div className="cart-item-image">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.dishName} />
                        ) : (
                          <div className="cart-item-image-placeholder">
                            <svg
                              viewBox="0 0 24 24"
                              width="32"
                              height="32"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="cart-item-details">
                        <h3 className="cart-item-name">{item.dishName}</h3>
                        {isUnavailable && (
                          <span className="cart-item-unavailable-badge">
                            No longer available
                          </span>
                        )}
                        <p className="cart-item-category">{item.category}</p>

                        {item.specialInstructions && (
                          <p className="cart-item-instructions">
                            <strong>Note:</strong> {item.specialInstructions}
                          </p>
                        )}

                        <div className="cart-item-sizes">
                          {item.quantities.map((qty) => (
                            <div key={qty.size} className="cart-item-size-row">
                              <span className="size-label-cart">
                                {qty.size.charAt(0).toUpperCase() +
                                  qty.size.slice(1)}{" "}
                                — ${qty.price.toFixed(2)}
                              </span>

                              <div className="cart-quantity-controls">
                                <button
                                  className="cart-qty-btn minus"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      qty.size,
                                      qty.quantity - 1,
                                    )
                                  }
                                  disabled={loading}
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="cart-qty-display">
                                  {qty.quantity}
                                </span>
                                <button
                                  className="cart-qty-btn plus"
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      qty.size,
                                      qty.quantity + 1,
                                    )
                                  }
                                  disabled={loading}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              <span className="cart-item-subtotal">
                                ${(qty.price * qty.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        className="cart-item-remove"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loading}
                        aria-label="Remove item"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-section">
              <div className="cart-total-row">
                <span className="cart-total-label">Subtotal:</span>
                <span className="cart-total-amount">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {isUnverified ? (
              <div className="cart-verify-block">
                <p className="cart-verify-message">
                  Verify your account before checking out.
                </p>
                <button
                  className="cart-verify-btn"
                  onClick={handleSendVerification}
                  disabled={verifyLoading}
                >
                  {verifyLoading ? "Sending…" : "Send Verification Email"}
                </button>
                {verifyMessage && (
                  <p className="cart-verify-feedback">{verifyMessage}</p>
                )}
                <button className="checkout-btn" disabled={true}>
                  Proceed to Checkout
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                className="checkout-btn"
                onClick={handleProceedToCheckout}
                disabled={loading || hasUnavailable}
              >
                {hasUnavailable
                  ? "Remove unavailable items to continue"
                  : "Proceed to Checkout"}
                {!hasUnavailable && (
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;
