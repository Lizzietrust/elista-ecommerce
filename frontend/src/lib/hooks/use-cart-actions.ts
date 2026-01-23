"use client";

import { useCart } from "./use-cart";
import { toast } from "react-hot-toast";
import { Product } from "@/types";

export function useCartActions() {
  const cart = useCart();

  const addToCart = (
    product: Product,
    quantity: number = 1,
    color?: string,
    size?: string,
  ) => {
    cart.addItem({
      product,
      quantity,
      color,
      size,
      price: product.price,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    cart.removeItem(productId, color, size);
    toast.success("Item removed from cart");
  };

  const updateCartQuantity = (
    productId: string,
    quantity: number,
    color?: string,
    size?: string,
  ) => {
    cart.updateQuantity(productId, quantity, color, size);
    toast.success("Cart updated");
  };

  const clearCart = () => {
    cart.clearCart();
    toast.success("Cart cleared");
  };

  return {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cart,
  };
}
