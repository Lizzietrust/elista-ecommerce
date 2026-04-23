import {
  typedApiClient,
  BaseApiResponse,
  PaginatedApiResponse,
} from "./client";

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
  comparePrice?: number;
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

// Query parameters
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

// Response interfaces
export interface ProductListResponse extends PaginatedApiResponse<Product> {
  // Inherits all properties from PaginatedApiResponse
}

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

// Main products API functions
export const productApi = {
  // Get all products with filters
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

    const response = await typedApiClient.get<ProductListResponse>(
      "/products",
      {
        params: queryParams,
      },
    );

    // Extract categories and brands from the response data
    const categoriesSet = new Set<string>();
    const brandsSet = new Set<string>();

    response.data.forEach((product) => {
      if (product.category?.name) {
        categoriesSet.add(product.category.name);
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

  // Get product by ID (with related products)
  getById: async (
    id: string,
  ): Promise<BaseApiResponse<ProductDetailsResponseData>> => {
    return typedApiClient.get<BaseApiResponse<ProductDetailsResponseData>>(
      `/products/${id}`,
    );
  },

  // Get product by slug (with related products)
  getBySlug: async (
    slug: string,
  ): Promise<BaseApiResponse<ProductDetailsResponseData>> => {
    return typedApiClient.get<BaseApiResponse<ProductDetailsResponseData>>(
      `/products/slug/${slug}`,
    );
  },

  // Search products
  search: async (
    query: string,
    limit: number = 20,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>("/products/search", {
      params: { q: query, limit },
    });
  },

  // Get featured products
  getFeatured: async (
    limit: number = 8,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>(
      "/products/featured",
      {
        params: { limit },
      },
    );
  },

  // Get new arrivals
  getNewArrivals: async (
    limit: number = 12,
    days: number = 30,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>(
      "/products/new-arrivals",
      {
        params: { limit, days },
      },
    );
  },

  // Get best sellers
  getBestSellers: async (
    limit: number = 12,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>(
      "/products/best-sellers",
      {
        params: { limit },
      },
    );
  },

  // Get products by category (with pagination support)
  getProductsByCategory: async (
    categoryId: string,
    params: Omit<ProductQueryParams, "category"> = {},
  ): Promise<PaginatedApiResponse<Product> & { category: Category }> => {
    return typedApiClient.get<
      PaginatedApiResponse<Product> & { category: Category }
    >(`/products/category/${categoryId}`, { params });
  },

  // Get related products
  getRelated: async (
    productId: string,
    limit: number = 4,
  ): Promise<BaseApiResponse<Product[]>> => {
    return typedApiClient.get<BaseApiResponse<Product[]>>(
      `/products/related/${productId}`,
      {
        params: { limit },
      },
    );
  },

  // Get product filters
  getProductFilters: async (): Promise<
    BaseApiResponse<ProductFiltersResponseData>
  > => {
    // First get all products to calculate filters
    const response = await typedApiClient.get<PaginatedApiResponse<Product>>(
      "/products",
      {
        params: { limit: 100 },
      },
    );

    const categoriesSet = new Set<string>();
    const brandsSet = new Set<string>();
    const prices: number[] = [];

    response.data.forEach((product) => {
      if (product.category?.name) {
        categoriesSet.add(product.category.name);
      }
      if (product.brand) {
        brandsSet.add(product.brand);
      }
      prices.push(product.price);
    });

    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };

    return {
      success: true,
      data: {
        categories: Array.from(categoriesSet),
        brands: Array.from(brandsSet),
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
  }): Promise<Product[]> => {
    const response = await typedApiClient.get<PaginatedApiResponse<Product>>(
      "/products",
      {
        params,
      },
    );
    return response.data;
  },
};

// Category API functions
export const categoryApi = {
  // Get all categories
  getAll: async (params?: {
    featured?: boolean;
    parent?: string;
    limit?: number;
  }): Promise<BaseApiResponse<Category[]>> => {
    return typedApiClient.get<BaseApiResponse<Category[]>>("/categories", {
      params,
    });
  },

  // Get category tree
  getTree: async (): Promise<BaseApiResponse<Category[]>> => {
    return typedApiClient.get<BaseApiResponse<Category[]>>("/categories/tree");
  },

  // Get category by slug
  getBySlug: async (slug: string): Promise<BaseApiResponse<Category>> => {
    return typedApiClient.get<BaseApiResponse<Category>>(
      `/categories/slug/${slug}`,
    );
  },

  // Get category with products
  getWithProducts: async (
    categoryId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
    },
  ): Promise<PaginatedApiResponse<Product> & { category: Category }> => {
    return typedApiClient.get<
      PaginatedApiResponse<Product> & { category: Category }
    >(`/categories/${categoryId}/products`, { params });
  },
};

// Export types as aliases for backward compatibility if needed
export type GetProductsParams = ProductQueryParams;
export type GetProductsResponse = ProductListResponse;
export type ProductFilters = ProductFiltersResponseData;
