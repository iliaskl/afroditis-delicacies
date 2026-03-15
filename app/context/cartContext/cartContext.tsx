import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../authContext/authContext";
import {
  getCart,
  addToCart as addToCartService,
  updateCartItemQuantity as updateCartItemService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

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
      if (!user) {
        setCartItems([]);
        return;
      }
      try {
        setLoading(true);
        const items = await getCart(user.uid);
        setCartItems(items);
      } catch (error) {
        console.error("Failed to load cart:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [user]);

  async function addToCart(
    item: Omit<CartItem, "id" | "userId" | "addedAt">,
  ): Promise<void> {
    if (!user) throw new Error("Must be logged in to add items to cart");
    await addToCartService(user.uid, item);
    await refreshCart();
  }

  async function updateQuantity(
    itemId: string,
    size: string,
    quantity: number,
  ): Promise<void> {
    if (!user) throw new Error("Must be logged in to update cart");
    await updateCartItemService(itemId, size, quantity);
    await refreshCart();
  }

  async function removeItem(itemId: string): Promise<void> {
    if (!user) throw new Error("Must be logged in to remove items");
    await removeFromCartService(itemId);
    await refreshCart();
  }

  async function clearCart(): Promise<void> {
    if (!user) throw new Error("Must be logged in to clear cart");
    await clearCartService(user.uid);
    setCartItems([]);
  }

  async function refreshCart(): Promise<void> {
    if (!user) return;
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
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
