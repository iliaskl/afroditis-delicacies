// MenuFilters.tsx — remove menuItems prop and count chip entirely
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
    <nav className="menu-sidebar-nav">
      <p className="menu-sidebar-label">Categories</p>

      {allCategories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`menu-sidebar-btn${selectedCategory === category ? " active" : ""}`}
        >
          <span className="menu-sidebar-btn-name">{category}</span>
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
