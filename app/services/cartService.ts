import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { CartItem, CartItemQuantity } from "../types/types";

export async function getCart(userId: string): Promise<CartItem[]> {
  try {
    const q = query(collection(db, "carts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        menuItemId: data.menuItemId,
        dishName: data.dishName,
        category: data.category,
        imageUrl: data.imageUrl || "",
        quantities: data.quantities || [],
        specialInstructions: data.specialInstructions || "",
        addedAt: data.addedAt?.toDate() || new Date(),
      } as CartItem;
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw new Error("Failed to fetch cart");
  }
}

export async function addToCart(
  userId: string,
  item: Omit<CartItem, "id" | "userId" | "addedAt">,
): Promise<void> {
  try {
    const cartRef = collection(db, "carts");
    const q = query(
      cartRef,
      where("userId", "==", userId),
      where("menuItemId", "==", item.menuItemId),
    );
    const existingItems = await getDocs(q);

    if (!existingItems.empty) {
      const existingDoc = existingItems.docs[0];
      const existingData = existingDoc.data();
      const updatedQuantities = [...(existingData.quantities || [])];

      item.quantities.forEach((newQty) => {
        const existingIndex = updatedQuantities.findIndex(
          (q) => q.size === newQty.size,
        );
        if (existingIndex >= 0) {
          updatedQuantities[existingIndex].quantity += newQty.quantity;
        } else {
          updatedQuantities.push(newQty);
        }
      });

      const existingInstructions = existingData.specialInstructions || "";
      const updatedInstructions =
        item.specialInstructions && existingInstructions
          ? `${existingInstructions}\n${item.specialInstructions}`
          : item.specialInstructions || existingInstructions;

      await updateDoc(existingDoc.ref, {
        quantities: updatedQuantities,
        specialInstructions: updatedInstructions,
        addedAt: Timestamp.now(),
      });
    } else {
      await addDoc(cartRef, {
        userId,
        menuItemId: item.menuItemId,
        dishName: item.dishName,
        category: item.category,
        imageUrl: item.imageUrl || "",
        quantities: item.quantities,
        specialInstructions: item.specialInstructions || "",
        addedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw new Error("Failed to add item to cart");
  }
}

export async function updateCartItemQuantity(
  cartItemId: string,
  size: string,
  quantity: number,
): Promise<void> {
  try {
    const cartItemRef = doc(db, "carts", cartItemId);
    const snapshot = await getDoc(cartItemRef);

    if (!snapshot.exists()) throw new Error("Cart item not found");

    const quantities: CartItemQuantity[] = snapshot.data().quantities || [];

    const updatedQuantities = quantities
      .map((q) => (q.size === size ? { ...q, quantity } : q))
      .filter((q) => q.quantity > 0);

    if (updatedQuantities.length === 0) {
      await deleteDoc(cartItemRef);
    } else {
      await updateDoc(cartItemRef, { quantities: updatedQuantities });
    }
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    throw new Error("Failed to update quantity");
  }
}

export async function removeFromCart(cartItemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "carts", cartItemId));
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw new Error("Failed to remove item from cart");
  }
}

export async function clearCart(userId: string): Promise<void> {
  try {
    const q = query(collection(db, "carts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart");
  }
}
