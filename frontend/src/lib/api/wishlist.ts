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
    const response = await typedApiClient.get<
      BaseApiResponse<WishlistResponse>
    >("/wishlist", { params });
    return response;
  },

  addToWishlist: async (
    productId: string,
    options?: { notes?: string; priority?: string; variant?: string },
  ) => {
    const response = await typedApiClient.post<
      BaseApiResponse<AddToWishlistResponse>
    >("/wishlist", {
      product: productId,
      ...options,
    });
    return response;
  },

  removeFromWishlist: async (productId: string) => {
    const response = await typedApiClient.delete<
      BaseApiResponse<{
        productId: string;
        wishlist: { id: string; itemCount: number };
      }>
    >(`/wishlist/${productId}`);
    return response;
  },

  checkInWishlist: async (productId: string) => {
    const response = await typedApiClient.get<
      BaseApiResponse<{ isInWishlist: boolean; itemDetails?: WishlistItem }>
    >(`/wishlist/check/${productId}`);
    return response;
  },

  clearWishlist: async () => {
    const response =
      await typedApiClient.delete<
        BaseApiResponse<{ wishlist: { id: string; itemCount: number } }>
      >("/wishlist/clear");
    return response;
  },

  updateWishlistItem: async (
    productId: string,
    updates: { notes?: string; priority?: string },
  ) => {
    const response = await typedApiClient.put<
      BaseApiResponse<{ item: WishlistItem }>
    >(`/wishlist/${productId}`, updates);
    return response;
  },

  moveToCart: async (productId: string, quantity?: number) => {
    const response = await typedApiClient.post<
      BaseApiResponse<{
        productId: string;
        movedToCart: boolean;
        wishlist: { id: string; itemCount: number };
      }>
    >(`/wishlist/${productId}/move-to-cart`, { quantity });
    return response;
  },

  getWishlistCount: async () => {
    const response =
      await typedApiClient.get<
        BaseApiResponse<{ count: number; isEmpty: boolean }>
      >("/wishlist/count");
    return response;
  },

  generateShareLink: async (expiryDays?: number) => {
    const response = await typedApiClient.post<
      BaseApiResponse<{
        shareUrl: string;
        token: string;
        expiresAt: string;
        expiryDays: number;
      }>
    >("/wishlist/share", { expiryDays });
    return response;
  },

  revokeShareLink: async () => {
    const response =
      await typedApiClient.delete<
        BaseApiResponse<{ wishlist: { id: string; isPublic: boolean } }>
      >("/wishlist/share");
    return response;
  },
};

export interface SharedWishlistResponse {
  wishlist: {
    id: string;
    name: string;
    itemCount: number;
    createdAt: string;
    shareExpiresAt: string;
  };
  user: {
    name: string;
    avatar?: string;
  };
  items: WishlistItem[];
}
