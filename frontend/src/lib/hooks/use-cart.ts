// /lib/hooks/use-cart.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id"> & { product: Product }) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    color?: string,
    size?: string,
  ) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) =>
              i.product._id === item.product._id &&
              i.color === item.color &&
              i.size === item.size,
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += item.quantity;
            return { items: updatedItems };
          }

          return {
            items: [
              ...state.items,
              { ...item, id: `${item.product._id}-${Date.now()}` },
            ],
          };
        });
      },

      removeItem: (productId, color, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product._id === productId &&
                item.color === color &&
                item.size === size
              ),
          ),
        }));
      },

      updateQuantity: (productId, quantity, color, size) => {
        set((state) => {
          const itemIndex = state.items.findIndex(
            (item) =>
              item.product._id === productId &&
              item.color === color &&
              item.size === size,
          );

          if (itemIndex === -1) return state;

          const updatedItems = [...state.items];
          if (quantity <= 0) {
            updatedItems.splice(itemIndex, 1);
          } else {
            updatedItems[itemIndex].quantity = quantity;
          }

          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
