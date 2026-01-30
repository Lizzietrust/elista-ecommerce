import { apiClient, ApiResponse, PaginatedResponse } from "./client";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: Array<{
    url: string;
    publicId?: string;
    thumbnail?: string;
  }>;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  brand?: string;
  sku?: string;
  stock: number;
  averageRating?: number;
  ratingsCount?: number;
  featured?: boolean;
  isActive: boolean;
  slug?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  seller?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | Category;
  children?: Category[];
  image?: string;
  featured?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  seller?: string;
}

export interface GetProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  categories?: string[];
  brands?: string[];
}

export interface ProductFilters {
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export const productApi = {
  // Get all products with filters
  getProducts: async (
    params: GetProductsParams = {},
  ): Promise<GetProductsResponse> => {
    const {
      page = 1,
      limit = 12,
      category,
      sort = "-createdAt",
      minPrice,
      maxPrice,
      rating,
      inStock,
      featured,
      search,
      seller,
    } = params;

    const queryParams: Record<string, any> = {
      page,
      limit,
      sort,
    };

    if (category) queryParams.category = category;
    if (minPrice !== undefined) queryParams.minPrice = minPrice;
    if (maxPrice !== undefined) queryParams.maxPrice = maxPrice;
    if (rating !== undefined) queryParams.rating = rating;
    if (inStock !== undefined) queryParams.inStock = inStock;
    if (featured !== undefined) queryParams.featured = featured;
    if (search) queryParams.search = search;
    if (seller) queryParams.seller = seller;

    const response = await apiClient.get<PaginatedResponse<Product>>(
      "/products",
      {
        params: queryParams,
      },
    );

    const categories = [
      ...new Set(response.data.map((p) => p.category?.name).filter(Boolean)),
    ] as string[];
    const brands = [
      ...new Set(response.data.map((p) => p.brand).filter(Boolean)),
    ] as string[];

    return {
      products: response.data,
      total: response.total,
      totalPages: response.totalPages,
      currentPage: response.currentPage,
      categories,
      brands,
    };
  },

  // Get product by ID (with related products)
  getById: async (
    id: string,
  ): Promise<ApiResponse<{ product: Product; relatedProducts: Product[] }>> => {
    return apiClient.get(`/products/${id}`);
  },

  // Get product by slug (with related products)
  getBySlug: async (
    slug: string,
  ): Promise<ApiResponse<{ product: Product; relatedProducts: Product[] }>> => {
    return apiClient.get(`/products/slug/${slug}`);
  },

  // Search products
  search: async (
    query: string,
    limit: number = 20,
  ): Promise<ApiResponse<Product[]>> => {
    return apiClient.get("/products/search", {
      params: { q: query, limit },
    });
  },

  // Get featured products
  getFeatured: async (limit: number = 8): Promise<ApiResponse<Product[]>> => {
    return apiClient.get("/products/featured", {
      params: { limit },
    });
  },

  // Get new arrivals
  getNewArrivals: async (
    limit: number = 12,
    days: number = 30,
  ): Promise<ApiResponse<Product[]>> => {
    return apiClient.get("/products/new-arrivals", {
      params: { limit, days },
    });
  },

  // Get best sellers
  getBestSellers: async (
    limit: number = 12,
  ): Promise<ApiResponse<Product[]>> => {
    return apiClient.get("/products/best-sellers", {
      params: { limit },
    });
  },

  // Get products by category (with pagination support)
  getProductsByCategory: async (
    categoryId: string,
    params: Omit<GetProductsParams, "category"> = {},
  ): Promise<PaginatedResponse<Product> & { category: any }> => {
    return apiClient.get(`/products/category/${categoryId}`, { params });
  },

  // Get related products
  getRelated: async (
    productId: string,
    limit: number = 4,
  ): Promise<ApiResponse<Product[]>> => {
    return apiClient.get(`/products/related/${productId}`, {
      params: { limit },
    });
  },

  // Get product filters
  getProductFilters: async (): Promise<ApiResponse<ProductFilters>> => {
    // If you don't have a dedicated endpoint, we can calculate from products
    const response = await apiClient.get<PaginatedResponse<Product>>(
      "/products",
      {
        params: { limit: 1000 }, // Get more products to calculate filters
      },
    );

    const categories = [
      ...new Set(response.data.map((p) => p.category?.name).filter(Boolean)),
    ] as string[];
    const brands = [
      ...new Set(response.data.map((p) => p.brand).filter(Boolean)),
    ] as string[];

    const prices = response.data.map((p) => p.price);
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };

    return {
      success: true,
      data: {
        categories,
        brands,
        priceRange,
      },
    };
  },

  // Legacy method for backward compatibility
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

  // Get category with products (updated to use paginated response)
  getWithProducts: async (
    categoryId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
    },
  ): Promise<PaginatedResponse<Product> & { category: Category }> => {
    const response = await apiClient.get(`/categories/${categoryId}/products`, {
      params,
    });
    return response.data;
  },
};

export type { GetProductsParams, GetProductsResponse, ProductFilters };
export default productApi;
