// /components/providers/cart-provider.tsx
"use client";

import { useCart } from "@/lib/hooks/use-cart";
import { createContext, useContext, useEffect, useState } from "react";

interface CartContextType {
  items: ReturnType<typeof useCart>["items"];
  addItem: ReturnType<typeof useCart>["addItem"];
  removeItem: ReturnType<typeof useCart>["removeItem"];
  updateQuantity: ReturnType<typeof useCart>["updateQuantity"];
  clearCart: ReturnType<typeof useCart>["clearCart"];
  getItemCount: () => number;
  getTotalPrice: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const getItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        addItem: cart.addItem,
        removeItem: cart.removeItem,
        updateQuantity: cart.updateQuantity,
        clearCart: cart.clearCart,
        getItemCount,
        getTotalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
