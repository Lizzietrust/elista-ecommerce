import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";
import {
  productApi,
  categoryApi,
  ProductQueryParams,
  ProductListResponse,
  Product,
  ProductFiltersResponseData,
  ProductDetailsResponseData,
  Category,
  SpecialProductsResponse,
} from "@/lib/api/products";
import { BaseApiResponse } from "../api/client";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductQueryParams) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  newArrivals: () => [...productKeys.all, "new-arrivals"] as const,
  bestSellers: () => [...productKeys.all, "best-sellers"] as const,
  search: (query: string) => [...productKeys.all, "search", query] as const,
  byCategory: (
    categoryId: string,
    filters: Omit<ProductQueryParams, "category">,
  ) => [...productKeys.all, "category", categoryId, filters] as const,
  filters: () => [...productKeys.all, "filters"] as const,
};

interface UseProductsOptions {
  endpoint?: "all" | "new-arrivals" | "featured" | "best-sellers";
  params?: ProductQueryParams & { limit?: number; days?: number };
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">;
}

export const useProducts = ({
  endpoint = "all",
  params = {},
  options = {},
}: UseProductsOptions = {}) => {
  let queryFn;
  let queryKey = ["products", endpoint, params];

  switch (endpoint) {
    case "new-arrivals":
      queryFn = async () => {
        const response = await productApi.getNewArrivals({
          limit: params.limit,
          days: params.days,
        });

        return response.data;
      };
      break;
    case "featured":
      queryFn = async () => {
        const response = await productApi.getFeaturedProducts({
          limit: params.limit,
          category: params.category,
        });

        return response.data?.data || response.data || [];
      };
      break;
    case "best-sellers":
      queryFn = async () => {
        const response = await productApi.getBestSellers({
          limit: params.limit,
        });

        return response.data?.data || response.data || [];
      };
      break;
    default:
      queryFn = () => productApi.getAllProducts(params);
  }

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useNewArrivals = (
  limit: number = 12,
  days: number = 30,
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<Product[], Error>({
    queryKey: [...productKeys.newArrivals(), { limit, days }],
    queryFn: async () => {
      const response = await productApi.getNewArrivals({ limit, days });

      return response.data || [];
    },
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useFeaturedProducts = (
  limit: number = 8,
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<Product[], Error>({
    queryKey: [...productKeys.featured(), { limit }],
    queryFn: async () => {
      const response = await productApi.getFeaturedProducts({ limit });

      return response.data?.data || response.data || [];
    },
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useBestSellers = (
  limit: number = 12,
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<Product[], Error>({
    queryKey: [...productKeys.bestSellers(), { limit }],
    queryFn: async () => {
      const response = await productApi.getBestSellers({ limit });

      return response.data?.data || response.data || [];
    },
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useProductsStandard = (
  params: ProductQueryParams = {},
  options?: Omit<
    UseQueryOptions<ProductListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ProductListResponse, Error>({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.getAllProducts(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useInfiniteProducts = (
  params: Omit<ProductQueryParams, "page"> = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      ProductListResponse,
      Error,
      InfiniteData<ProductListResponse>,
      readonly unknown[],
      number
    >,
    | "queryKey"
    | "queryFn"
    | "initialPageParam"
    | "getNextPageParam"
    | "getPreviousPageParam"
  >,
) => {
  return useInfiniteQuery<
    ProductListResponse,
    Error,
    InfiniteData<ProductListResponse>,
    readonly unknown[],
    number
  >({
    queryKey: productKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      productApi.getAllProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.currentPage > 1) {
        return firstPage.currentPage - 1;
      }
      return undefined;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useProduct = (
  id: string,
  options?: Omit<UseQueryOptions<Product, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<Product, Error>({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await productApi.getProductById(id);
      return response.data.product;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useProductById = (
  id: string,
  options?: Omit<
    UseQueryOptions<ProductDetailsResponseData, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ProductDetailsResponseData, Error>({
    queryKey: [...productKeys.detail(id), "byId"],
    queryFn: async () => {
      const response = await productApi.getProductById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useProductDetails = (
  id: string,
  options?: Omit<
    UseQueryOptions<ProductDetailsResponseData, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ProductDetailsResponseData, Error>({
    queryKey: [...productKeys.detail(id), "details"],
    queryFn: async () => {
      const response = await productApi.getProductById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useSearchProducts = (
  query: string,
  limit: number = 20,
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<Product[], Error>({
    queryKey: productKeys.search(query),
    queryFn: async () => {
      try {
        const response = await productApi.searchProducts(query, limit);

        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Search products query error:", error);

        return [];
      }
    },
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    ...options,
  });
};

export const useProductsByCategory = (
  categoryId: string,
  params: Omit<ProductQueryParams, "category"> = {},
  options?: Omit<
    UseQueryOptions<ProductListResponse & { category: Category }, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ProductListResponse & { category: Category }, Error>({
    queryKey: productKeys.byCategory(categoryId, params),
    queryFn: () => productApi.getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useProductFilters = (
  options?: Omit<
    UseQueryOptions<BaseApiResponse<ProductFiltersResponseData>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<ProductFiltersResponseData>, Error>({
    queryKey: productKeys.filters(),
    queryFn: () => productApi.getProductFilters(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
    ...options,
  });
};

export const useRelatedProducts = (
  productId: string,
  limit: number = 4,
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<Product[], Error>({
    queryKey: [...productKeys.detail(productId), "related", { limit }],
    queryFn: async () => {
      const response = await productApi.getRelated(productId, limit);
      return response.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useCategories = (
  params?: {
    featured?: boolean;
    parent?: string;
    limit?: number;
  },
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Category[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Category[]>, Error>({
    queryKey: ["categories", "list", params],
    queryFn: () => categoryApi.getAll(params),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useCategoryTree = (
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Category[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Category[]>, Error>({
    queryKey: ["categories", "tree"],
    queryFn: () => categoryApi.getTree(),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useCategoryBySlug = (
  slug: string,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Category>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Category>, Error>({
    queryKey: ["categories", "detail", slug],
    queryFn: () => categoryApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export { productKeys as productQueryKeys };
export type { ProductQueryParams as GetProductsParams };
export type { ProductListResponse as GetProductsResponse };
