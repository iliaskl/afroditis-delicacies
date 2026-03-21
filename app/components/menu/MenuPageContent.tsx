// app/components/menu/MenuPageContent.tsx
import type { MenuItem, MenuCategory } from "../../types/types";
import MenuFilters from "./MenuFilters";
import MenuCategorySection from "./MenuCategorySection";
import { useEditMenu } from "../editMenu/editMenu";

interface MenuPageContentProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  selectedCategory: string;
  isAdmin: boolean;
  draggedItem: MenuItem | null;
  dragOverItem: MenuItem | null;
  userFavorites: string[];
  editMenuProps: ReturnType<typeof useEditMenu>;
  onSelectCategory: (category: string) => void;
  onItemClick: (item: MenuItem, hasTwoSizes: boolean) => void;
  onDragStart: (e: React.DragEvent, item: MenuItem) => void;
  onDragOver: (e: React.DragEvent, item: MenuItem) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, item: MenuItem) => void;
  onDragEnd: () => void;
  handleSaveCategoryName: () => void;
  handleDeleteCategory: () => void;
  handleAddDish: () => void;
  handleEditDish: () => void;
  handleDeleteDish: () => void;
  handleAddCategory: () => void;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MenuPageContent({
  categories,
  menuItems,
  selectedCategory,
  isAdmin,
  draggedItem,
  dragOverItem,
  userFavorites,
  editMenuProps,
  onSelectCategory,
  onItemClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  handleSaveCategoryName,
  handleDeleteCategory,
  handleAddDish,
  handleEditDish,
  handleDeleteDish,
  handleAddCategory,
  handleImageSelect,
}: MenuPageContentProps) {
  const {
    categoryBeingEdited,
    categoryBeingDeleted,
    categoryForNewDish,
    showAddCategory,
    dishBeingEdited,
    dishBeingDeleted,
    newCategoryName,
    setNewCategoryName,
    dishName,
    setDishName,
    dishPrice,
    setDishPrice,
    dishSecondPrice,
    setDishSecondPrice,
    dishAvailable,
    setDishAvailable,
    dishImagePreview,
    newCategoryNameInput,
    setNewCategoryNameInput,
    newCategoryHasTwoSizes,
    setNewCategoryHasTwoSizes,
    isSubmitting,
    editCategory,
    deleteCategory,
    addDish,
    editDish,
    deleteDishConfirm,
    openAddCategory,
    closeAll,
  } = editMenuProps;

  const getFilteredItems = () => {
    let items =
      selectedCategory === "Full Menu"
        ? menuItems
        : menuItems.filter((item) => item.category === selectedCategory);
    if (!isAdmin) items = items.filter((item) => item.available);
    return items;
  };

  const groupedItems =
    selectedCategory === "Full Menu"
      ? categories.reduce(
          (acc, category) => {
            const items = menuItems.filter(
              (item) => item.category === category.name,
            );
            const displayItems = isAdmin
              ? items
              : items.filter((item) => item.available);
            if (isAdmin || displayItems.length > 0) {
              acc[category.name] = {
                items: displayItems,
                hasTwoSizes: category.hasTwoSizes,
              };
            }
            return acc;
          },
          {} as Record<string, { items: MenuItem[]; hasTwoSizes: boolean }>,
        )
      : {
          [selectedCategory]: {
            items: getFilteredItems(),
            hasTwoSizes:
              categories.find((cat) => cat.name === selectedCategory)
                ?.hasTwoSizes || false,
          },
        };

  return (
    <>
      {/* ── Sidebar ── */}
      <aside className="menu-sidebar">
        <MenuFilters
          categories={categories}
          selectedCategory={selectedCategory}
          isAdmin={isAdmin}
          onSelectCategory={onSelectCategory}
          onOpenAddCategory={openAddCategory}
        />

        <div className="menu-leadtime-card">
          <p className="menu-leadtime-eyebrow">Order lead times</p>
          <div className="menu-leadtime-row">
            <span className="menu-leadtime-label">1–3 items</span>
            <span className="menu-leadtime-value">3 days</span>
          </div>
          <div className="menu-leadtime-row">
            <span className="menu-leadtime-label">4–7 items</span>
            <span className="menu-leadtime-value">1 week</span>
          </div>
          <div className="menu-leadtime-row">
            <span className="menu-leadtime-label">Catering (8+)</span>
            <span className="menu-leadtime-value">3 weeks</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="menu-main">
        <div className="menu-main-inner">
          {Object.entries(groupedItems).map(
            ([categoryName, { items, hasTwoSizes }]) => (
              <MenuCategorySection
                key={categoryName}
                categoryName={categoryName}
                items={items}
                hasTwoSizes={hasTwoSizes}
                isAdmin={!!isAdmin}
                draggedItem={draggedItem}
                dragOverItem={dragOverItem}
                userFavorites={userFavorites}
                onEditCategory={editCategory}
                onDeleteCategory={deleteCategory}
                onAddDish={addDish}
                onItemClick={onItemClick}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
              />
            ),
          )}
        </div>
      </div>

      {/* ── EditMenu popups — untouched ── */}
      {categoryBeingEdited && (
        <>
          <div className="edit-overlay" onClick={closeAll} />
          <div className="edit-menu-popup">
            <h2>Edit Category</h2>
            <p className="popup-subtitle">Rename this category</p>
            <div className="form-group">
              <label>Current Name:</label>
              <div className="current-value">{categoryBeingEdited}</div>
            </div>
            <div className="form-group">
              <label>New Name:</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter new category name"
              />
            </div>
            <div className="popup-buttons">
              <button
                className="save-btn"
                onClick={handleSaveCategoryName}
                disabled={isSubmitting || !newCategoryName.trim()}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="cancel-btn"
                onClick={closeAll}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {categoryBeingDeleted && (
        <>
          <div className="edit-overlay" onClick={closeAll} />
          <div className="edit-menu-popup">
            <h2>Delete Category</h2>
            <p className="popup-subtitle warning">
              This action cannot be undone
            </p>
            <p className="confirmation-text">
              Are you sure you want to delete{" "}
              <strong>{categoryBeingDeleted}</strong> and all its dishes?
            </p>
            <div className="popup-buttons">
              <button
                className="delete-button"
                onClick={handleDeleteCategory}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Category"}
              </button>
              <button
                className="cancel-btn"
                onClick={closeAll}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {categoryForNewDish && (
        <>
          <div className="edit-overlay" onClick={closeAll} />
          <div className="edit-menu-popup">
            <h2>Add Dish</h2>
            <p className="popup-subtitle">Adding to: {categoryForNewDish}</p>
            <div className="form-group">
              <label>Dish Name:</label>
              <input
                type="text"
                placeholder="e.g. Moussaka"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  placeholder="10"
                  min="0"
                  step="0.01"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Large Price: (optional)</label>
                <input
                  type="number"
                  placeholder="10"
                  min="0"
                  step="0.01"
                  value={dishSecondPrice}
                  onChange={(e) => setDishSecondPrice(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dishAvailable}
                  onChange={(e) =>
                    editMenuProps.setDishAvailable(e.target.checked)
                  }
                  disabled={isSubmitting}
                />
                <span>Dish is available</span>
              </label>
            </div>
            <div className="form-group">
              <label>Dish Image:</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isSubmitting}
                  className="file-input"
                  id="dish-image-upload"
                />
                <label htmlFor="dish-image-upload" className="file-input-label">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Choose Image
                </label>
                {dishImagePreview && (
                  <div className="image-preview">
                    <img src={dishImagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="popup-buttons">
              <button
                className="save-btn"
                onClick={handleAddDish}
                disabled={isSubmitting || !dishName.trim() || !dishPrice.trim()}
              >
                {isSubmitting ? "Adding..." : "Add Dish"}
              </button>
              <button
                className="cancel-btn"
                onClick={closeAll}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {dishBeingEdited && (
        <>
          <div className="edit-overlay" onClick={closeAll} />
          <div className="edit-menu-popup">
            <h2>Edit Dish</h2>
            <div className="form-group">
              <label>Dish Name:</label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Large Price: (optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={dishSecondPrice}
                  onChange={(e) => setDishSecondPrice(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dishAvailable}
                  onChange={(e) =>
                    editMenuProps.setDishAvailable(e.target.checked)
                  }
                  disabled={isSubmitting}
                />
                <span>Dish is available</span>
              </label>
            </div>
            <div className="form-group">
              <label>Dish Image:</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isSubmitting}
                  className="file-input"
                  id="edit-dish-image-upload"
                />
                <label
                  htmlFor="edit-dish-image-upload"
                  className="file-input-label"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Choose Image
                </label>
                {dishImagePreview && (
                  <div className="image-preview">
                    <img src={dishImagePreview} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="popup-buttons">
              <button
                className="save-btn"
                onClick={handleEditDish}
                disabled={isSubmitting || !dishName.trim() || !dishPrice.trim()}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="delete-button"
                onClick={() => {
                  closeAll();
                  deleteDishConfirm(dishBeingEdited);
                }}
                disabled={isSubmitting}
              >
                Delete Dish
              </button>
              <button
                className="cancel-btn"
                onClick={closeAll}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {dishBeingDeleted && (
        <>
          <div className="edit-overlay" onClick={closeAll} />
          <div className="edit-menu-popup">
            <h2>Delete Dish</h2>
            <p className="popup-subtitle warning">
              This action cannot be undone
            </p>
            <p className="confirmation-text">
              Are you sure you want to delete{" "}
              <strong>{dishBeingDeleted.name}</strong>?
            </p>
            <div className="popup-buttons">
              <button
                className="delete-button"
                onClick={handleDeleteDish}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Dish"}
              </button>
              <button
                className="cancel-btn"
                onClick={closeAll}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {showAddCategory && (
        <>
          <div className="edit-overlay" onClick={closeAll} />
          <div className="edit-menu-popup">
            <h2>Add Category</h2>
            <div className="form-group">
              <label>Category Name:</label>
              <input
                type="text"
                placeholder="e.g. Desserts"
                value={newCategoryNameInput}
                onChange={(e) => setNewCategoryNameInput(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newCategoryHasTwoSizes}
                  onChange={(e) => setNewCategoryHasTwoSizes(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span>Has two sizes (Small / Large)</span>
              </label>
            </div>
            <div className="popup-buttons">
              <button
                className="save-btn"
                onClick={handleAddCategory}
                disabled={isSubmitting || !newCategoryNameInput.trim()}
              >
                {isSubmitting ? "Adding..." : "Add Category"}
              </button>
              <button
                className="cancel-btn"
                onClick={closeAll}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
