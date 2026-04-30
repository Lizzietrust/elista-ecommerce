import {
  typedApiClient,
  BaseApiResponse,
  PaginatedApiResponse,
} from "./client";
import { Product } from "./products";

export interface WishlistItem {
  product: Product;
  addedAt: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
  variant?: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  name: string;
  isPublic: boolean;
  shareToken?: string;
  shareExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  isEmpty: boolean;
}

export interface WishlistResponse {
  wishlist: {
    _id: string;
    name: string;
    itemCount: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
  };
  items: WishlistItem[];
  summary: {
    totalItems: number;
    totalEstimatedCost: number;
    inStockCount: number;
    outOfStockCount: number;
    averageRating: number;
  };
}

export interface AddToWishlistResponse {
  item: WishlistItem;
  wishlist: {
    id: string;
    itemCount: number;
  };
}

export const wishlistApi = {
  getWishlist: async (params?: { populate?: boolean; sort?: string }) => {
    return typedApiClient.get<BaseApiResponse<WishlistResponse>>("/wishlist", {
      params,
    });
  },

  addToWishlist: async (
    productId: string,
    options?: { notes?: string; priority?: string; variant?: string },
  ) => {
    return typedApiClient.post<BaseApiResponse<AddToWishlistResponse>>(
      "/wishlist",
      {
        productId,
        ...options,
      },
    );
  },

  removeFromWishlist: async (productId: string) => {
    return typedApiClient.delete<
      BaseApiResponse<{
        productId: string;
        wishlist: { id: string; itemCount: number };
      }>
    >(`/wishlist/${productId}`);
  },

  checkInWishlist: async (productId: string) => {
    return typedApiClient.get<
      BaseApiResponse<{ isInWishlist: boolean; itemDetails?: WishlistItem }>
    >(`/wishlist/check/${productId}`);
  },

  clearWishlist: async () => {
    return typedApiClient.delete<
      BaseApiResponse<{ wishlist: { id: string; itemCount: number } }>
    >("/wishlist/clear");
  },

  updateWishlistItem: async (
    productId: string,
    updates: { notes?: string; priority?: string },
  ) => {
    return typedApiClient.put<BaseApiResponse<{ item: WishlistItem }>>(
      `/wishlist/${productId}`,
      updates,
    );
  },

  moveToCart: async (productId: string, quantity?: number) => {
    return typedApiClient.post<
      BaseApiResponse<{
        productId: string;
        movedToCart: boolean;
        wishlist: { id: string; itemCount: number };
      }>
    >(`/wishlist/${productId}/move-to-cart`, { quantity });
  },

  getWishlistCount: async () => {
    return typedApiClient.get<
      BaseApiResponse<{ count: number; isEmpty: boolean }>
    >("/wishlist/count");
  },

  generateShareLink: async (expiryDays?: number) => {
    return typedApiClient.post<
      BaseApiResponse<{
        shareUrl: string;
        token: string;
        expiresAt: string;
        expiryDays: number;
      }>

        >("/wishlist/share", { expiryDays });
  },

  revokeShareLink: async () => {
    return typedApiClient.delete<
      BaseApiResponse<{ wishlist: { id: string; isPublic: boolean } }>
    >("/wishlist/share");
  },
};
