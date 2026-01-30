// lib/hooks/use-products.ts
import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import {
  productsApi,
  GetProductsParams,
  Product,
  GetProductsResponse,
} from "@/lib/api/products";

// Query keys for caching
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: GetProductsParams) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  newArrivals: () => [...productKeys.all, "new-arrivals"] as const,
  bestSellers: () => [...productKeys.all, "best-sellers"] as const,
  search: (query: string) => [...productKeys.all, "search", query] as const,
  byCategory: (categoryId: string, filters: GetProductsParams) =>
    [...productKeys.all, "category", categoryId, filters] as const,
  filters: () => [...productKeys.all, "filters"] as const,
};

// Main products query hook
export const useProducts = (
  params: GetProductsParams = {},
  options?: UseQueryOptions<GetProductsResponse, Error>,
) => {
  return useQuery<GetProductsResponse, Error>({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getProducts(params),
    keepPreviousData: true, // Smooth pagination
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
};

// Infinite scroll products hook
export const useInfiniteProducts = (
  params: Omit<GetProductsParams, "page"> = {},
  options?: UseInfiniteQueryOptions<GetProductsResponse, Error>,
) => {
  return useInfiniteQuery<GetProductsResponse, Error>({
    queryKey: productKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      productsApi.getProducts({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    ...options,
  });
};

// Single product hook
export const useProduct = (
  id: string,
  options?: UseQueryOptions<Product, Error>,
) => {
  return useQuery<Product, Error>({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await productsApi.getProductById(id);
      return response.data.product;
    },
    enabled: !!id, // Only run if id exists
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
};

// Product by slug hook
export const useProductBySlug = (
  slug: string,
  options?: UseQueryOptions<Product, Error>,
) => {
  return useQuery<Product, Error>({
    queryKey: productKeys.detail(slug),
    queryFn: async () => {
      const response = await productsApi.getProductBySlug(slug);
      return response.data.product;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
    ...options,
  });
};

// Featured products hook
export const useFeaturedProducts = (
  limit: number = 8,
  options?: UseQueryOptions<Product[], Error>,
) => {
  return useQuery<Product[], Error>({
    queryKey: productKeys.featured(),
    queryFn: () =>
      productsApi.getFeaturedProducts(limit).then((res) => res.data),
    staleTime: 1000 * 60 * 15, // 15 minutes
    ...options,
  });
};

// New arrivals hook
export const useNewArrivals = (
  limit: number = 12,
  days: number = 30,
  options?: UseQueryOptions<Product[], Error>,
) => {
  return useQuery<Product[], Error>({
    queryKey: productKeys.newArrivals(),
    queryFn: () =>
      productsApi.getNewArrivals(limit, days).then((res) => res.data),
    staleTime: 1000 * 60 * 15,
    ...options,
  });
};

// Best sellers hook
export const useBestSellers = (
  limit: number = 12,
  options?: UseQueryOptions<Product[], Error>,
) => {
  return useQuery<Product[], Error>({
    queryKey: productKeys.bestSellers(),
    queryFn: () => productsApi.getBestSellers(limit).then((res) => res.data),
    staleTime: 1000 * 60 * 15,
    ...options,
  });
};

// Search products hook
export const useSearchProducts = (
  query: string,
  limit: number = 20,
  options?: UseQueryOptions<Product[], Error>,
) => {
  return useQuery<Product[], Error>({
    queryKey: productKeys.search(query),
    queryFn: () =>
      productsApi.searchProducts(query, limit).then((res) => res.data),
    enabled: query.length > 0, // Only run if there's a query
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

// Products by category hook
export const useProductsByCategory = (
  categoryId: string,
  params: Omit<GetProductsParams, "category"> = {},
  options?: UseQueryOptions<any, Error>,
) => {
  return useQuery<any, Error>({
    queryKey: productKeys.byCategory(categoryId, params),
    queryFn: () => productsApi.getProductsByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

// Product filters hook
export const useProductFilters = (options?: UseQueryOptions<any, Error>) => {
  return useQuery<any, Error>({
    queryKey: productKeys.filters(),
    queryFn: () => productsApi.getProductFilters(),
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });
};
