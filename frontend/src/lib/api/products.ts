import { apiClient } from "./client";
import { Product, Category } from "@/types";

export const productApi = {
  // Get all products
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
  }) => {
    const response = await apiClient.get("/products", { params });
    return response.data;
  },

  // Get single product
  getById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Get product by slug
  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Get featured products
  getFeatured: async (limit?: number) => {
    const response = await apiClient.get("/products/featured", {
      params: { limit },
    });
    return response.data;
  },

  // Search products
  search: async (query: string, limit?: number) => {
    const response = await apiClient.get("/products/search", {
      params: { q: query, limit },
    });
    return response.data;
  },

  // Get related products
  getRelated: async (productId: string, limit?: number) => {
    const response = await apiClient.get(`/products/related/${productId}`, {
      params: { limit },
    });
    return response.data;
  },
};

export const categoryApi = {
  // Get all categories
  getAll: async (params?: {
    featured?: boolean;
    parent?: string;
    limit?: number;
  }) => {
    const response = await apiClient.get("/categories", { params });
    return response.data;
  },

  // Get category tree
  getTree: async () => {
    const response = await apiClient.get("/categories/tree");
    return response.data;
  },

  // Get category by slug
  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // Get category with products
  getWithProducts: async (
    categoryId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
    },
  ) => {
    const response = await apiClient.get(`/categories/${categoryId}/products`, {
      params,
    });
    return response.data;
  },
};
