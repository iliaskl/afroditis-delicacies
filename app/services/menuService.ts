import {
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  addDoc,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { MenuItem, MenuCategory } from "../types/types";

export async function uploadDishImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append("folder", "dish-images");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading dish image:", error);
    throw new Error("Failed to upload image");
  }
}

export async function getMenuData(): Promise<{
  categories: MenuCategory[];
  items: MenuItem[];
  menuNote: string;
}> {
  try {
    const categoriesSnapshot = await getDocs(
      query(collection(db, "categories"), orderBy("order", "asc")),
    );
    const categories: MenuCategory[] = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      hasTwoSizes: doc.data().hasTwoSizes || false,
      order: doc.data().order || 0,
    }));

    const menuItemsSnapshot = await getDocs(
      query(collection(db, "menuItems"), orderBy("order", "asc")),
    );
    const items: MenuItem[] = menuItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      category: doc.data().category,
      price: doc.data().price,
      secondPrice: doc.data().secondPrice || undefined,
      available: doc.data().available ?? true,
      imgPath: doc.data().imgPath || "",
      description: doc.data().description || "",
      order: doc.data().order || 0,
    }));

    return { categories, items, menuNote: "" };
  } catch (error) {
    console.error("Error fetching menu data:", error);
    throw new Error("Failed to fetch menu data");
  }
}

export async function updateCategoryName(
  oldName: string,
  newName: string,
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Update the category document
    const categorySnapshot = await getDocs(
      query(collection(db, "categories"), where("name", "==", oldName)),
    );
    if (categorySnapshot.empty)
      throw new Error(`Category "${oldName}" not found`);
    categorySnapshot.forEach((d) => batch.update(d.ref, { name: newName }));

    // 2. Update all menu items with this category
    const itemsSnapshot = await getDocs(
      query(collection(db, "menuItems"), where("category", "==", oldName)),
    );
    itemsSnapshot.forEach((d) => batch.update(d.ref, { category: newName }));

    // 3. Commit
    await batch.commit();
  } catch (error) {
    console.error("Error updating category name:", error);
    throw new Error("Failed to update category name");
  }
}

export async function deleteCategory(categoryName: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Find and delete the category document
    const categorySnapshot = await getDocs(
      query(collection(db, "categories"), where("name", "==", categoryName)),
    );
    if (categorySnapshot.empty)
      throw new Error(`Category "${categoryName}" not found`);
    categorySnapshot.forEach((d) => batch.delete(d.ref));

    // 2. Find and delete all menu items with this category
    const itemsSnapshot = await getDocs(
      query(collection(db, "menuItems"), where("category", "==", categoryName)),
    );
    itemsSnapshot.forEach((d) => batch.delete(d.ref));

    // 3. Commit
    await batch.commit();
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}

export async function addDish(dishData: {
  name: string;
  category: string;
  price: number;
  secondPrice?: number;
  available: boolean;
  imgPath?: string;
}): Promise<void> {
  try {
    const menuItemsRef = collection(db, "menuItems");
    const itemsSnapshot = await getDocs(
      query(menuItemsRef, where("category", "==", dishData.category)),
    );

    let maxOrder = 0;
    itemsSnapshot.forEach((doc) => {
      const order = doc.data().order || 0;
      if (order > maxOrder) maxOrder = order;
    });

    await addDoc(menuItemsRef, {
      name: dishData.name,
      category: dishData.category,
      price: dishData.price,
      secondPrice: dishData.secondPrice || null,
      available: dishData.available,
      imgPath: dishData.imgPath || "",
      description: "",
      order: maxOrder + 1,
    });
  } catch (error) {
    console.error("Error adding dish:", error);
    throw new Error("Failed to add dish");
  }
}

export async function addCategory(categoryData: {
  name: string;
  hasTwoSizes: boolean;
}): Promise<void> {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    let maxOrder = 0;
    snapshot.forEach((doc) => {
      const order = doc.data().order || 0;
      if (order > maxOrder) maxOrder = order;
    });

    await addDoc(categoriesRef, {
      name: categoryData.name,
      hasTwoSizes: categoryData.hasTwoSizes,
      order: maxOrder + 1,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    throw new Error("Failed to add category");
  }
}

export async function updateDish(
  dishId: string,
  dishData: {
    name: string;
    price: number;
    secondPrice?: number;
    available: boolean;
    imgPath?: string;
  },
): Promise<void> {
  try {
    await updateDoc(doc(db, "menuItems", dishId), {
      name: dishData.name,
      price: dishData.price,
      secondPrice: dishData.secondPrice || null,
      available: dishData.available,
      imgPath: dishData.imgPath || "",
    });
  } catch (error) {
    console.error("Error updating dish:", error);
    throw new Error("Failed to update dish");
  }
}

export async function deleteDish(dishId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "menuItems", dishId));
  } catch (error) {
    console.error("Error deleting dish:", error);
    throw new Error("Failed to delete dish");
  }
}

export async function reorderDishes(
  dishUpdates: Array<{ id: string; order: number }>,
): Promise<void> {
  try {
    const batch = writeBatch(db);
    dishUpdates.forEach(({ id, order }) => {
      batch.update(doc(db, "menuItems", id), { order });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error reordering dishes:", error);
    throw new Error("Failed to reorder dishes");
  }
}
