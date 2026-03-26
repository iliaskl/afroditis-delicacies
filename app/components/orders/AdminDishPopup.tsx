// app/components/orders/AdminDishPopup.tsx
import { useState } from "react";
import type { MenuItem } from "../../types/types";
import "../../styles/adminDishPopup.css";

interface AdminDishPopupProps {
  item: MenuItem;
  hasTwoSizes: boolean;
  onAdd: (size: string, price: number, quantity: number) => void;
  onClose: () => void;
}

export default function AdminDishPopup({
  item,
  hasTwoSizes,
  onAdd,
  onClose,
}: AdminDishPopupProps) {
  const [smallQty, setSmallQty] = useState(0);
  const [largeQty, setLargeQty] = useState(0);
  const [singleQty, setSingleQty] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const totalSelected = hasTwoSizes ? smallQty + largeQty : singleQty;

  const subtotal = hasTwoSizes
    ? smallQty * item.price + largeQty * (item.secondPrice ?? item.price)
    : singleQty * item.price;

  const handleAdd = () => {
    if (hasTwoSizes) {
      if (smallQty > 0) onAdd("small", item.price, smallQty);
      if (largeQty > 0)
        onAdd("large", item.secondPrice ?? item.price, largeQty);
    } else {
      if (singleQty > 0) onAdd("single", item.price, singleQty);
    }
    onClose();
  };

  return (
    <div className="adp-overlay" onClick={onClose}>
      <div className="adp-popup" onClick={(e) => e.stopPropagation()}>
        {item.imgPath ? (
          <div className="adp-image">
            <img src={item.imgPath} alt={item.name} />
          </div>
        ) : (
          <div className="adp-image adp-image-placeholder">
            <span>No image available</span>
          </div>
        )}

        <div className="adp-body">
          <h3 className="adp-name">{item.name}</h3>
          {item.description && (
            <p className="adp-description">{item.description}</p>
          )}

          <p className="adp-options-label">OPTIONS:</p>

          <div className="adp-sizes">
            {hasTwoSizes ? (
              <>
                <div className="adp-size-row">
                  <span className="adp-size-label">Small</span>
                  <span className="adp-size-price">
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="adp-qty-controls">
                    <button
                      className="adp-qty-btn"
                      onClick={() => setSmallQty((q) => Math.max(0, q - 1))}
                    >
                      −
                    </button>
                    <span className="adp-qty-display">{smallQty}</span>
                    <button
                      className="adp-qty-btn"
                      onClick={() => setSmallQty((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="adp-size-row">
                  <span className="adp-size-label">Large</span>
                  <span className="adp-size-price">
                    ${(item.secondPrice ?? item.price).toFixed(2)}
                  </span>
                  <div className="adp-qty-controls">
                    <button
                      className="adp-qty-btn"
                      onClick={() => setLargeQty((q) => Math.max(0, q - 1))}
                    >
                      −
                    </button>
                    <span className="adp-qty-display">{largeQty}</span>
                    <button
                      className="adp-qty-btn"
                      onClick={() => setLargeQty((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="adp-size-row">
                <span className="adp-size-label">Single</span>
                <span className="adp-size-price">${item.price.toFixed(2)}</span>
                <div className="adp-qty-controls">
                  <button
                    className="adp-qty-btn"
                    onClick={() => setSingleQty((q) => Math.max(0, q - 1))}
                  >
                    −
                  </button>
                  <span className="adp-qty-display">{singleQty}</span>
                  <button
                    className="adp-qty-btn"
                    onClick={() => setSingleQty((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="adp-instructions">
            <p className="adp-instructions-label">SPECIAL INSTRUCTIONS</p>
            <textarea
              className="adp-instructions-input"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Add a note (e.g. allergies, etc)"
              maxLength={140}
              rows={3}
            />
            <p className="adp-instructions-count">
              {specialInstructions.length}/140 characters
            </p>
          </div>

          <div className="adp-actions">
            <button className="adp-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="adp-add"
              onClick={handleAdd}
              disabled={totalSelected === 0}
            >
              Add to Order — ${subtotal.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
