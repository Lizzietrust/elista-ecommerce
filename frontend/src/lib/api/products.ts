import {
  typedApiClient,
  BaseApiResponse,
  PaginatedApiResponse,
} from "./client";

export type { Product, ProductImage, Category } from "@/types";
import type { Product, Category } from "@/types";

export interface ProductQueryParams {
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

export interface ProductListResponse extends PaginatedApiResponse<Product> {}

export interface ProductFiltersResponseData {
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface ProductDetailsResponseData {
  product: Product;
  relatedProducts: Product[];
}

export const productApi = {
  getProducts: async (
    params: ProductQueryParams = {},
  ): Promise<ProductListResponse> => {
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

    const queryParams: Record<string, any> = { page, limit, sort };

    if (category) queryParams.category = category;
    if (minPrice !== undefined) queryParams.minPrice = minPrice;
    if (maxPrice !== undefined) queryParams.maxPrice = maxPrice;
    if (rating !== undefined) queryParams.rating = rating;
    if (inStock !== undefined) queryParams.inStock = inStock;
    if (featured !== undefined) queryParams.featured = featured;
    if (search) queryParams.search = search;
    if (seller) queryParams.seller = seller;

    const response = await typedApiClient.get<ProductListResponse>(
      "/products",
      { params: queryParams },
    );

    const categoriesSet = new Set<string>();
    const brandsSet = new Set<string>();

    response.data.forEach((product) => {
      if (product.category && typeof product.category === "object") {
        categoriesSet.add(product.category.name);
      } else if (typeof product.category === "string") {
        categoriesSet.add(product.category);
      }
      if (product.brand) {
        brandsSet.add(product.brand);
      }
    });

    return {
      ...response,
      data: response.data,
      categories: Array.from(categoriesSet),
      brands: Array.from(brandsSet),
    };
  },

  getById: async (
    id: string,
  ): Promise<BaseApiResponse<ProductDetailsResponseData>> => {
    return typedApiClient.get<BaseApiResponse<ProductDetailsResponseData>>(
      `/products/${id}`,
    );
  },

  getBySlug: async (
    slug: string,
  ): Promise<BaseApiResponse<ProductDetailsResponseData>> => {
    return typedApiClient.get<BaseApiResponse<ProductDetailsResponseData>>(
      `/products/slug/${slug}`,
    );
  },

  search: async (
    query: string,
    limit: number = 20,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>("/products/search", {
      params: { q: query, limit },
    });
  },

  getFeatured: async (
    limit: number = 8,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>(
      "/products/featured",
      { params: { limit } },
    );
  },

  getNewArrivals: async (
    limit: number = 12,
    days: number = 30,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>(
      "/products/new-arrivals",
      { params: { limit, days } },
    );
  },

  getBestSellers: async (
    limit: number = 12,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>(
      "/products/best-sellers",
      { params: { limit } },
    );
  },

  getProductsByCategory: async (
    categoryId: string,
    params: Omit<ProductQueryParams, "category"> = {},
  ): Promise<PaginatedApiResponse<Product> & { category: Category }> => {
    return typedApiClient.get<
      PaginatedApiResponse<Product> & { category: Category }
    >(`/products/category/${categoryId}`, { params });
  },

  getRelated: async (
    productId: string,
    limit: number = 4,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>(
      `/products/related/${productId}`,
      { params: { limit } },
    );
  },

  getProductFilters: async (): Promise<
    BaseApiResponse<ProductFiltersResponseData>
  > => {
    const response = await typedApiClient.get<PaginatedApiResponse<Product>>(
      "/products",
      { params: { limit: 100 } },
    );

    const categoriesSet = new Set<string>();
    const brandsSet = new Set<string>();
    const prices: number[] = [];

    response.data.forEach((product) => {
      if (product.category && typeof product.category === "object") {
        categoriesSet.add(product.category.name);
      } else if (typeof product.category === "string") {
        categoriesSet.add(product.category);
      }
      if (product.brand) {
        brandsSet.add(product.brand);
      }
      prices.push(product.price);
    });

    return {
      success: true,
      data: {
        categories: Array.from(categoriesSet),
        brands: Array.from(brandsSet),
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
      },
    };
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
  }): Promise<Product[]> => {
    const response = await typedApiClient.get<PaginatedApiResponse<Product>>(
      "/products",
      { params },
    );
    return response.data;
  },
};

export const categoryApi = {
  getAll: async (params?: {
    featured?: boolean;
    parent?: string;
    limit?: number;
  }): Promise<BaseApiResponse<Category[]>> => {
    return typedApiClient.get<BaseApiResponse<Category[]>>("/categories", {
      params,
    });
  },

  getTree: async (): Promise<BaseApiResponse<Category[]>> => {
    return typedApiClient.get<BaseApiResponse<Category[]>>("/categories/tree");
  },

  getBySlug: async (slug: string): Promise<BaseApiResponse<Category>> => {
    return typedApiClient.get<BaseApiResponse<Category>>(
      `/categories/slug/${slug}`,
    );
  },

  getWithProducts: async (
    categoryId: string,
    params?: { page?: number; limit?: number; sort?: string },
  ): Promise<PaginatedApiResponse<Product> & { category: Category }> => {
    return typedApiClient.get<
      PaginatedApiResponse<Product> & { category: Category }
    >(`/categories/${categoryId}/products`, { params });
  },
};

export type GetProductsParams = ProductQueryParams;
export type GetProductsResponse = ProductListResponse;
export type ProductFilters = ProductFiltersResponseData;
