// app/components/menu/MenuCategorySection.tsx
import type { MenuItem } from "../../types/types";

interface MenuCategorySectionProps {
  categoryName: string;
  items: MenuItem[];
  hasTwoSizes: boolean;
  isAdmin: boolean;
  draggedItem: MenuItem | null;
  dragOverItem: MenuItem | null;
  userFavorites: string[];
  onEditCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
  onAddDish: (categoryName: string) => void;
  onItemClick: (item: MenuItem, hasTwoSizes: boolean) => void;
  onDragStart: (e: React.DragEvent, item: MenuItem) => void;
  onDragOver: (e: React.DragEvent, item: MenuItem) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, item: MenuItem) => void;
  onDragEnd: () => void;
}

export default function MenuCategorySection({
  categoryName,
  items,
  hasTwoSizes,
  isAdmin,
  draggedItem,
  dragOverItem,
  userFavorites,
  onEditCategory,
  onDeleteCategory,
  onAddDish,
  onItemClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: MenuCategorySectionProps) {
  const hasTwoPrices =
    hasTwoSizes || items.some((i) => i.secondPrice && i.secondPrice > 0);

  return (
    <div className="menu-category">
      {/* ── Category header: title → admin icons → rule → size labels ── */}
      <div className="category-header-row">
        <h2 className="category-title">{categoryName}</h2>

        {isAdmin && (
          <div className="category-admin-controls">
            <button
              onClick={() => onEditCategory(categoryName)}
              className="admin-icon-btn edit-btn"
              title="Edit category"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => onDeleteCategory(categoryName)}
              className="admin-icon-btn delete-btn"
              title="Delete category"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
            <button
              onClick={() => onAddDish(categoryName)}
              className="admin-icon-btn add-btn"
              title="Add dish"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        )}

        <div className="category-header-rule" />

        {hasTwoPrices ? (
          <div className="category-size-headers">
            <span className="category-size-col">Small</span>
            {/* <span className="category-size-sep">/</span> */}
            <span className="category-size-col">Large</span>
          </div>
        ) : (
          <div className="category-size-placeholder" />
        )}
      </div>

      {/* ── Dish list ── */}
      <div className="menu-items">
        {items.length > 0
          ? items.map((item) => (
              <div
                key={item.id}
                className={[
                  "menu-item",
                  !item.available ? "unavailable" : "",
                  isAdmin || item.available ? "clickable" : "",
                  isAdmin ? "admin-view" : "",
                  draggedItem?.id === item.id ? "dragging" : "",
                  dragOverItem?.id === item.id ? "drag-over" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                draggable={!!isAdmin}
                onDragStart={(e) => isAdmin && onDragStart(e, item)}
                onDragOver={(e) => isAdmin && onDragOver(e, item)}
                onDragLeave={isAdmin ? onDragLeave : undefined}
                onDrop={(e) => isAdmin && onDrop(e, item)}
                onDragEnd={isAdmin ? onDragEnd : undefined}
                onClick={() =>
                  !draggedItem && (isAdmin || item.available)
                    ? onItemClick(item, hasTwoSizes)
                    : undefined
                }
                style={{
                  cursor: isAdmin
                    ? draggedItem
                      ? "grabbing"
                      : "pointer"
                    : item.available
                      ? "pointer"
                      : "default",
                }}
              >
                {isAdmin && (
                  <div className="drag-handle">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </div>
                )}

                <div className="item-content">
                  <p className="item-name">{item.name}</p>
                  {userFavorites.includes(item.id) && (
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      style={{
                        marginLeft: "6px",
                        color: "#c0392b",
                        display: "inline",
                        verticalAlign: "middle",
                      }}
                      aria-label="Favorited"
                    >
                      <path
                        fill="currentColor"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                  )}
                  {!item.available && isAdmin && (
                    <span className="unavailable-badge">unavailable</span>
                  )}
                </div>

                <div className="item-pricing">
                  {item.secondPrice && item.secondPrice > 0 ? (
                    <div className="pies-pricing">
                      <span className="price price-column">
                        ${item.secondPrice.toFixed(2)}
                      </span>
                      <span className="price price-column">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="price single-price">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))
          : isAdmin && (
              <div className="empty-category">
                <p>No dishes yet. Click + to add one.</p>
              </div>
            )}
      </div>
    </div>
  );
}
