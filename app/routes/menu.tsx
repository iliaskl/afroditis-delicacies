// app/routes/menu.tsx
import { useState, useEffect } from "react";
import Header from "../components/utils/header";
import Footer from "../components/utils/footer";
import { useUserProfile } from "../context/userContext/userProfile";
import { useAuth } from "../context/authContext/authContext";
import {
  getMenuData,
  updateCategoryName,
  deleteCategory as deleteCategoryService,
  addDish as addDishService,
  addCategory as addCategoryService,
  updateDish as updateDishService,
  deleteDish as deleteDishService,
  reorderDishes as reorderDishesService,
  uploadDishImage,
} from "../services/menuService";
import { useEditMenu } from "../components/editMenu/editMenu";
import type { MenuItem, MenuCategory } from "../types/types";
import MenuItemPopup from "../components/menuItemPopup/MenuItemPopup";
import MenuPageContent from "../components/menu/MenuPageContent";
import "../styles/menu.css";

export default function Menu() {
  const { user } = useAuth();
  const profile = useUserProfile();
  const isAdmin = user && profile?.role === "admin";

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Full Menu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<MenuItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategoryHasTwoSizes, setSelectedCategoryHasTwoSizes] =
    useState(false);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  const editMenuProps = useEditMenu();
  const { setIsSubmitting, closeAll, deleteDishConfirm } = editMenuProps;

  useEffect(() => {
    if (!user) {
      setUserFavorites([]);
      return;
    }
    import("../services/favoritesService").then(({ getUserFavorites }) => {
      getUserFavorites(user.uid).then(setUserFavorites);
    });
  }, [user]);

  useEffect(() => {
    async function fetchMenuData() {
      try {
        setLoading(true);
        const data = await getMenuData();
        setCategories(data.categories);
        setMenuItems(data.items);
        setError(null);
      } catch {
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenuData();
  }, []);

  const refreshMenu = async () => {
    const data = await getMenuData();
    setCategories(data.categories);
    setMenuItems(data.items);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
    if (user) {
      import("../services/favoritesService").then(({ getUserFavorites }) => {
        getUserFavorites(user.uid).then(setUserFavorites);
      });
    }
  };

  const handleMenuItemClick = (item: MenuItem, hasTwoSizes: boolean) => {
    if (isAdmin) {
      editMenuProps.editDish(item);
    } else {
      setSelectedItem(item);
      setSelectedCategoryHasTwoSizes(hasTwoSizes);
    }
  };

  const handleSaveCategoryName = async () => {
    const { categoryBeingEdited, newCategoryName } = editMenuProps;
    if (!categoryBeingEdited || !newCategoryName.trim()) {
      alert("Please enter a valid category name");
      return;
    }
    if (newCategoryName.trim() === categoryBeingEdited) {
      closeAll();
      return;
    }
    try {
      setIsSubmitting(true);
      await updateCategoryName(categoryBeingEdited, newCategoryName.trim());
      await refreshMenu();
      if (selectedCategory === categoryBeingEdited)
        setSelectedCategory(newCategoryName.trim());
      alert("Category updated successfully!");
      closeAll();
    } catch {
      alert("Failed to update category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    const { categoryBeingDeleted } = editMenuProps;
    if (!categoryBeingDeleted) return;
    try {
      setIsSubmitting(true);
      await deleteCategoryService(categoryBeingDeleted);
      await refreshMenu();
      if (selectedCategory === categoryBeingDeleted)
        setSelectedCategory("Full Menu");
      alert("Category and associated dishes deleted successfully!");
      closeAll();
    } catch {
      alert("Failed to delete category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDish = async () => {
    const {
      categoryForNewDish,
      dishName,
      dishPrice,
      dishSecondPrice,
      dishAvailable,
      dishImage,
    } = editMenuProps;
    if (!categoryForNewDish || !dishName.trim() || !dishPrice.trim()) {
      alert("Please fill in dish name and price");
      return;
    }
    const price = parseFloat(dishPrice);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }
    let secondPrice: number | undefined;
    if (dishSecondPrice.trim()) {
      secondPrice = parseFloat(dishSecondPrice);
      if (isNaN(secondPrice) || secondPrice <= 0) {
        alert("Please enter a valid second price or leave it empty");
        return;
      }
    }
    try {
      setIsSubmitting(true);
      const imgPath = dishImage ? await uploadDishImage(dishImage) : "";
      await addDishService({
        name: dishName.trim(),
        category: categoryForNewDish,
        price,
        secondPrice,
        available: dishAvailable,
        imgPath,
      });
      await refreshMenu();
      alert("Dish added successfully!");
      closeAll();
    } catch {
      alert("Failed to add dish. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDish = async () => {
    const {
      dishBeingEdited,
      dishName,
      dishPrice,
      dishSecondPrice,
      dishAvailable,
      dishImage,
    } = editMenuProps;
    if (!dishBeingEdited || !dishName.trim() || !dishPrice.trim()) {
      alert("Please fill in dish name and price");
      return;
    }
    const price = parseFloat(dishPrice);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }
    let secondPrice: number | undefined;
    if (dishSecondPrice.trim()) {
      secondPrice = parseFloat(dishSecondPrice);
      if (isNaN(secondPrice) || secondPrice <= 0) {
        alert("Please enter a valid second price or leave it empty");
        return;
      }
    }
    try {
      setIsSubmitting(true);
      let imgPath = dishBeingEdited.imgPath;
      if (dishImage) imgPath = await uploadDishImage(dishImage);
      await updateDishService(dishBeingEdited.id, {
        name: dishName.trim(),
        price,
        secondPrice,
        available: dishAvailable,
        imgPath,
      });
      await refreshMenu();
      alert("Dish updated successfully!");
      closeAll();
    } catch {
      alert("Failed to update dish. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDish = async () => {
    const { dishBeingDeleted } = editMenuProps;
    if (!dishBeingDeleted) return;
    try {
      setIsSubmitting(true);
      await deleteDishService(dishBeingDeleted.id);
      await refreshMenu();
      alert("Dish deleted successfully!");
      closeAll();
    } catch {
      alert("Failed to delete dish. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    const { newCategoryNameInput, newCategoryHasTwoSizes } = editMenuProps;
    if (!newCategoryNameInput.trim()) {
      alert("Please enter a category name");
      return;
    }
    try {
      setIsSubmitting(true);
      await addCategoryService({
        name: newCategoryNameInput.trim(),
        hasTwoSizes: newCategoryHasTwoSizes,
      });
      await refreshMenu();
      alert("Category added successfully!");
      closeAll();
    } catch {
      alert("Failed to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    editMenuProps.setDishImage(file);
    const reader = new FileReader();
    reader.onloadend = () =>
      editMenuProps.setDishImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragStart = (e: React.DragEvent, item: MenuItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, item: MenuItem) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (
      draggedItem &&
      draggedItem.id !== item.id &&
      draggedItem.category === item.category
    ) {
      setDragOverItem(item);
    }
  };

  const handleDragLeave = () => setDragOverItem(null);

  const handleDrop = async (e: React.DragEvent, dropTarget: MenuItem) => {
    e.preventDefault();
    if (
      !draggedItem ||
      draggedItem.id === dropTarget.id ||
      draggedItem.category !== dropTarget.category
    ) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    try {
      const categoryItems = menuItems
        .filter((item) => item.category === draggedItem.category)
        .sort((a, b) => a.order - b.order);
      const draggedIndex = categoryItems.findIndex(
        (item) => item.id === draggedItem.id,
      );
      const dropIndex = categoryItems.findIndex(
        (item) => item.id === dropTarget.id,
      );
      const reordered = [...categoryItems];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(dropIndex, 0, removed);
      await reorderDishesService(
        reordered.map((item, index) => ({ id: item.id, order: index + 1 })),
      );
      await refreshMenu();
    } catch {
      alert("Failed to reorder dishes. Please try again.");
    } finally {
      setDraggedItem(null);
      setDragOverItem(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen font-sans flex flex-col"
        style={{ background: "var(--warm-white)" }}
      >
        <Header />
        <main className="menu-page">
          <div className="menu-sidebar" />
          <div className="menu-main">
            <p className="menu-loading-text">Loading menu…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen font-sans flex flex-col"
        style={{ background: "var(--warm-white)" }}
      >
        <Header />
        <main className="menu-page">
          <div className="menu-sidebar" />
          <div className="menu-main">
            <p className="menu-error-text">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans flex flex-col"
      style={{ background: "var(--warm-white)" }}
    >
      <Header />
      <main className="menu-page">
        <MenuPageContent
          categories={categories}
          menuItems={menuItems}
          selectedCategory={selectedCategory}
          isAdmin={!!isAdmin}
          draggedItem={draggedItem}
          dragOverItem={dragOverItem}
          userFavorites={userFavorites}
          editMenuProps={editMenuProps}
          onSelectCategory={setSelectedCategory}
          onItemClick={handleMenuItemClick}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          handleSaveCategoryName={handleSaveCategoryName}
          handleDeleteCategory={handleDeleteCategory}
          handleAddDish={handleAddDish}
          handleEditDish={handleEditDish}
          handleDeleteDish={handleDeleteDish}
          handleAddCategory={handleAddCategory}
          handleImageSelect={handleImageSelect}
        />
      </main>
      {selectedItem && (
        <MenuItemPopup
          item={selectedItem}
          hasTwoSizes={selectedCategoryHasTwoSizes}
          onClose={handleClosePopup}
        />
      )}
      <Footer />
    </div>
  );
}
