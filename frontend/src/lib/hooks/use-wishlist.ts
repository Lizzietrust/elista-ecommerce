"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface WishlistItem {
  id: string;
  product: Product;
  addedDate: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  itemCount: number;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          // Check if already in wishlist
          if (state.items.some((item) => item.product._id === product._id)) {
            return state;
          }

          const newItem: WishlistItem = {
            id: `${product._id}-${Date.now()}`,
            product,
            addedDate: new Date().toISOString(),
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        }));
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.product._id === productId);
      },

      get itemCount() {
        return get().items.length;
      },
    }),
    {
      name: "wishlist-storage",
      skipHydration: true, // Prevents hydration mismatch in Next.js
    },
  ),
);
