// app/components/account/FavoritesView.tsx
import { useState } from "react";
import type { MenuItem } from "../../types/types";
import MenuItemPopup from "../menuItemPopup/MenuItemPopup";

interface FavoritesViewProps {
  favoriteItems: MenuItem[];
  favoritesLoading: boolean;
  removingId: string | null;
  hasTwoSizesMap: Record<string, boolean>;
  onRemove: (menuItemId: string) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteItems,
  favoritesLoading,
  removingId,
  hasTwoSizesMap,
  onRemove,
}) => {
  const [popupItem, setPopupItem] = useState<MenuItem | null>(null);

  if (favoritesLoading) return <p className="empty-state">Loading...</p>;

  if (favoriteItems.length === 0) {
    return (
      <div className="favorites-view">
        <p className="empty-state">
          You haven't added any favorite dishes yet.
        </p>
        <p className="empty-state-hint">
          Browse our menu and click "Add to Favorites" to save dishes!
        </p>
      </div>
    );
  }

  return (
    <div className="favorites-view">
      <div className="favorites-list">
        {favoriteItems.map((item) => (
          <div key={item.id} className="favorite-item">
            <div className="favorite-item-image-wrap">
              {item.imgPath ? (
                <img
                  src={item.imgPath}
                  alt={item.name}
                  className="favorite-item-image"
                />
              ) : (
                <div className="favorite-item-image favorite-item-image--placeholder">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path
                      fill="currentColor"
                      d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="favorite-item-info">
              <span className="favorite-item-name">{item.name}</span>
              <span className="favorite-item-price">
                {hasTwoSizesMap[item.id]
                  ? `From $${Math.min(item.price, item.secondPrice ?? item.price).toFixed(2)}`
                  : `$${item.price.toFixed(2)}`}
              </span>
            </div>

            <div className="favorite-item-actions">
              <button
                className="favorite-order-btn"
                onClick={() => setPopupItem(item)}
                aria-label={`Order ${item.name}`}
              >
                Order
              </button>
              <button
                className="favorite-remove-btn"
                onClick={() => onRemove(item.id)}
                disabled={removingId === item.id}
                aria-label={`Remove ${item.name} from favorites`}
              >
                {removingId === item.id ? (
                  "..."
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      fill="currentColor"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {popupItem && (
        <MenuItemPopup
          item={popupItem}
          hasTwoSizes={hasTwoSizesMap[popupItem.id] ?? false}
          onClose={() => setPopupItem(null)}
        />
      )}
    </div>
  );
};

export default FavoritesView;
