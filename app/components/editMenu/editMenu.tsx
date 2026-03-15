import { useState } from "react";
import type { MenuItem } from "../../types/types";

export function useEditMenu() {
  const [categoryBeingEdited, setCategoryBeingEdited] = useState<string | null>(
    null,
  );
  const [categoryBeingDeleted, setCategoryBeingDeleted] = useState<
    string | null
  >(null);
  const [categoryForNewDish, setCategoryForNewDish] = useState<string | null>(
    null,
  );
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [dishBeingEdited, setDishBeingEdited] = useState<MenuItem | null>(null);
  const [dishBeingDeleted, setDishBeingDeleted] = useState<MenuItem | null>(
    null,
  );

  const [newCategoryName, setNewCategoryName] = useState("");

  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishSecondPrice, setDishSecondPrice] = useState("");
  const [dishAvailable, setDishAvailable] = useState(true);
  const [dishImage, setDishImage] = useState<File | null>(null);
  const [dishImagePreview, setDishImagePreview] = useState("");

  const [newCategoryNameInput, setNewCategoryNameInput] = useState("");
  const [newCategoryHasTwoSizes, setNewCategoryHasTwoSizes] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  function editCategory(name: string) {
    setCategoryBeingEdited(name);
    setNewCategoryName(name);
  }

  function deleteCategory(name: string) {
    setCategoryBeingDeleted(name);
  }

  function addDish(categoryName: string) {
    setCategoryForNewDish(categoryName);
    setDishName("");
    setDishPrice("");
    setDishSecondPrice("");
    setDishAvailable(true);
    setDishImage(null);
    setDishImagePreview("");
  }

  function editDish(dish: MenuItem) {
    setDishBeingEdited(dish);
    setDishName(dish.name);
    setDishPrice(dish.price.toString());
    setDishSecondPrice(dish.secondPrice ? dish.secondPrice.toString() : "");
    setDishAvailable(dish.available ?? true);
    setDishImage(null);
    setDishImagePreview(dish.imgPath || "");
  }

  function deleteDishConfirm(dish: MenuItem) {
    setDishBeingDeleted(dish);
  }

  function openAddCategory() {
    setShowAddCategory(true);
    setNewCategoryNameInput("");
    setNewCategoryHasTwoSizes(false);
  }

  function closeAll() {
    setCategoryBeingEdited(null);
    setCategoryBeingDeleted(null);
    setCategoryForNewDish(null);
    setShowAddCategory(false);
    setDishBeingEdited(null);
    setDishBeingDeleted(null);
    setNewCategoryName("");
    setDishName("");
    setDishPrice("");
    setDishSecondPrice("");
    setDishAvailable(true);
    setDishImage(null);
    setDishImagePreview("");
    setNewCategoryNameInput("");
    setNewCategoryHasTwoSizes(false);
    setIsSubmitting(false);
  }

  return {
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
    dishImage,
    setDishImage,
    dishImagePreview,
    setDishImagePreview,
    newCategoryNameInput,
    setNewCategoryNameInput,
    newCategoryHasTwoSizes,
    setNewCategoryHasTwoSizes,
    isSubmitting,
    setIsSubmitting,
    editCategory,
    deleteCategory,
    addDish,
    editDish,
    deleteDishConfirm,
    openAddCategory,
    closeAll,
  };
}
