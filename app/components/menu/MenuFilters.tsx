// MenuFilters.tsx — remove menuItems prop and count chip entirely
import type { MenuCategory } from "../../types/types";

interface MenuFiltersProps {
  categories: MenuCategory[];
  selectedCategory: string;
  isAdmin: boolean;
  onSelectCategory: (category: string) => void;
  onOpenAddCategory: () => void;
  draggedCategory: string | null;
  dragOverCategory: string | null;
  onCategoryDrop: (draggedName: string, targetName: string) => void;
  onCategoryDragStart: (name: string) => void;
  onCategoryDragOver: (name: string) => void;
  onCategoryDragEnd: () => void;
}

export default function MenuFilters({
  categories,
  selectedCategory,
  isAdmin,
  onSelectCategory,
  onOpenAddCategory,
  draggedCategory,
  dragOverCategory,
  onCategoryDrop,
  onCategoryDragStart,
  onCategoryDragOver,
  onCategoryDragEnd,
}: MenuFiltersProps) {
  return (
    <nav className="menu-sidebar-nav">
      <p className="menu-sidebar-label">Categories</p>

      {/* Full Menu — never draggable */}
      <button
        onClick={() => onSelectCategory("Full Menu")}
        className={`menu-sidebar-btn${selectedCategory === "Full Menu" ? " active" : ""}`}
      >
        <span className="menu-sidebar-btn-name">Full Menu</span>
      </button>

      {/* Real categories — draggable for admin */}
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => !draggedCategory && onSelectCategory(category.name)}
          className={[
            "menu-sidebar-btn",
            selectedCategory === category.name ? "active" : "",
            isAdmin && draggedCategory === category.name ? "cat-dragging" : "",
            isAdmin && dragOverCategory === category.name
              ? "cat-drag-over"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          draggable={isAdmin}
          onDragStart={
            isAdmin
              ? (e) => {
                  e.dataTransfer.effectAllowed = "move";
                  onCategoryDragStart(category.name);
                }
              : undefined
          }
          onDragOver={
            isAdmin
              ? (e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (draggedCategory && draggedCategory !== category.name)
                    onCategoryDragOver(category.name);
                }
              : undefined
          }
          onDragLeave={isAdmin ? () => onCategoryDragOver("") : undefined}
          onDrop={
            isAdmin
              ? (e) => {
                  e.preventDefault();
                  if (draggedCategory && draggedCategory !== category.name)
                    onCategoryDrop(draggedCategory, category.name);
                  onCategoryDragEnd();
                }
              : undefined
          }
          onDragEnd={isAdmin ? onCategoryDragEnd : undefined}
        >
          {isAdmin && (
            <span className="cat-drag-handle" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="12"
                height="12"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </span>
          )}
          <span className="menu-sidebar-btn-name">{category.name}</span>
        </button>
      ))}

      {isAdmin && (
        <button onClick={onOpenAddCategory} className="menu-sidebar-add-btn">
          <span>+</span>
          Add Category
        </button>
      )}
    </nav>
  );
}
