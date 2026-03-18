// app/components/menu/MenuFilters.tsx
import type { MenuCategory } from "../../types/types";

interface MenuFiltersProps {
  categories: MenuCategory[];
  selectedCategory: string;
  isAdmin: boolean;
  onSelectCategory: (category: string) => void;
  onOpenAddCategory: () => void;
}

export default function MenuFilters({
  categories,
  selectedCategory,
  isAdmin,
  onSelectCategory,
  onOpenAddCategory,
}: MenuFiltersProps) {
  const allCategories = ["Full Menu", ...categories.map((cat) => cat.name)];

  return (
    <>
      <div className="menu-filters">
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
          >
            {category}
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="add-category-section">
          <button onClick={onOpenAddCategory} className="add-category-btn">
            <span className="plus-icon">+</span>
            Add Category
          </button>
        </div>
      )}
    </>
  );
}
