import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../authContext/authContext";
import {
  getCart,
  addToCart as addToCartService,
  updateCartItemQuantity as updateCartItemService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
  getGuestCart,
  addToGuestCart,
  updateGuestCartItemQuantity,
  removeFromGuestCart,
  clearGuestCart,
  mergeGuestCartIntoFirestore,
} from "../../services/cartService";
import type { CartItem } from "../../types/types";

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (
    item: Omit<CartItem, "id" | "userId" | "addedAt">,
  ) => Promise<void>;
  updateQuantity: (
    itemId: string,
    size: string,
    quantity: number,
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

// Converts guest cart items (no id/userId/addedAt) into full CartItem shape for local state
function guestItemsToCartItems(
  items: Omit<CartItem, "id" | "userId" | "addedAt">[],
): CartItem[] {
  return items.map((item) => ({
    ...item,
    id: item.menuItemId,
    userId: "guest",
    addedAt: new Date(),
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const prevUserRef = useRef<string | null>(null);

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + item.quantities.reduce((sum, q) => sum + q.quantity, 0),
    0,
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.quantities.reduce((sum, q) => sum + q.price * q.quantity, 0),
    0,
  );

  useEffect(() => {
    async function loadCart() {
      const prevUid = prevUserRef.current;
      const currentUid = user?.uid ?? null;
      prevUserRef.current = currentUid;

      // Guest → logged in: merge then load from Firestore
      if (!prevUid && currentUid) {
        try {
          setLoading(true);
          await mergeGuestCartIntoFirestore(currentUid);
          const items = await getCart(currentUid);
          setCartItems(items);
        } catch (error) {
          console.error("Failed to merge/load cart:", error);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Logged in: load from Firestore
      if (currentUid) {
        try {
          setLoading(true);
          const items = await getCart(currentUid);
          setCartItems(items);
        } catch (error) {
          console.error("Failed to load cart:", error);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Guest: load from localStorage
      setCartItems(guestItemsToCartItems(getGuestCart()));
    }

    loadCart();
  }, [user]);

  async function addToCart(
    item: Omit<CartItem, "id" | "userId" | "addedAt">,
  ): Promise<void> {
    if (!user) {
      addToGuestCart(item);
      setCartItems(guestItemsToCartItems(getGuestCart()));
      return;
    }
    await addToCartService(user.uid, item);
    await refreshCart();
  }

  async function updateQuantity(
    itemId: string,
    size: string,
    quantity: number,
  ): Promise<void> {
    if (!user) {
      updateGuestCartItemQuantity(itemId, size, quantity);
      setCartItems(guestItemsToCartItems(getGuestCart()));
      return;
    }
    await updateCartItemService(itemId, size, quantity);
    await refreshCart();
  }

  async function removeItem(itemId: string): Promise<void> {
    if (!user) {
      removeFromGuestCart(itemId);
      setCartItems(guestItemsToCartItems(getGuestCart()));
      return;
    }
    await removeFromCartService(itemId);
    await refreshCart();
  }

  async function clearCart(): Promise<void> {
    if (!user) {
      clearGuestCart();
      setCartItems([]);
      return;
    }
    await clearCartService(user.uid);
    setCartItems([]);
  }

  async function refreshCart(): Promise<void> {
    if (!user) {
      setCartItems(guestItemsToCartItems(getGuestCart()));
      return;
    }
    const items = await getCart(user.uid);
    setCartItems(items);
  }

  const value: CartContextType = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
