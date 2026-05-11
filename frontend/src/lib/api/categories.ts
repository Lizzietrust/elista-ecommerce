import { apiRequest, BaseApiResponse, PaginatedApiResponse } from "./client";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  image?: {
    url: string;
    publicId: string;
    altText?: string;
  };
  isActive: boolean;
  featured: boolean;
  productCount: number;
  sortOrder: number;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithProducts extends Category {
  activeProductsCount: number;
  subcategories?: Category[];
  parentCategory?: Category | null;
  featuredProducts?: any[];
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  depth: number;
  featuredProducts?: any[];
}

export interface CategoryQueryParams {
  isActive?: string | boolean;
  featured?: boolean;
  parent?: string | null;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  includeProducts?: boolean;
}

export interface PaginatedCategoriesResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: Category[];
}

export const categoryApi = {
  getAll: (
    params?: CategoryQueryParams,
  ): Promise<BaseApiResponse<Category[]>> => {
    return apiRequest({
      method: "GET",
      url: "/categories",
      params,
    });
  },

  getPaginated: (
    params?: CategoryQueryParams,
  ): Promise<PaginatedCategoriesResponse> => {
    return apiRequest({
      method: "GET",
      url: "/categories/paginated",
      params: {
        ...params,
        isActive: params?.isActive !== undefined ? params.isActive : true,
      },
    });
  },

  getById: (id: string): Promise<BaseApiResponse<CategoryWithProducts>> => {
    return apiRequest({
      method: "GET",
      url: `/categories/${id}`,
    });
  },

  getBySlug: (slug: string): Promise<BaseApiResponse<Category>> => {
    return apiRequest({
      method: "GET",
      url: `/categories/slug/${slug}`,
    });
  },

  getTree: (
    includeProducts?: boolean,
  ): Promise<BaseApiResponse<CategoryTree[]>> => {
    return apiRequest({
      method: "GET",
      url: "/categories/tree",
      params: { includeProducts: includeProducts ? "true" : "false" },
    });
  },

  getFeatured: (
    limit?: number,
  ): Promise<BaseApiResponse<CategoryWithProducts[]>> => {
    return apiRequest({
      method: "GET",
      url: "/categories/featured",
      params: { limit },
    });
  },

  getCategoryWithProducts: (
    id: string,
    page?: number,
    limit?: number,
  ): Promise<BaseApiResponse<{ category: Category; products: any }>> => {
    return apiRequest({
      method: "GET",
      url: `/categories/${id}/products`,
      params: { page, limit },
    });
  },
};
