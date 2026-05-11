import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  categoryApi,
  Category,
  CategoryWithProducts,
  CategoryTree,
  CategoryQueryParams,
  PaginatedCategoriesResponse,
} from "@/lib/api/categories";
import { BaseApiResponse } from "../api/client";
import {
  formatCategories,
  FormattedCategory,
} from "@/lib/utils/formatCategories";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params: CategoryQueryParams) =>
    [...categoryKeys.lists(), params] as const,
  paginated: (params: CategoryQueryParams) =>
    [...categoryKeys.all, "paginated", params] as const,
  paginatedFormatted: (params: CategoryQueryParams) =>
    [...categoryKeys.all, "paginated", "formatted", params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  detailBySlug: (slug: string) =>
    [...categoryKeys.details(), "slug", slug] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
  featured: () => [...categoryKeys.all, "featured"] as const,
  withProducts: (id: string) =>
    [...categoryKeys.all, "with-products", id] as const,
};

export const usePaginatedFormattedCategories = (
  params: CategoryQueryParams = {},
  options?: Omit<
    UseQueryOptions<
      {
        data: FormattedCategory[];
        total: number;
        totalPages: number;
        currentPage: number;
      },
      Error
    >,
    "queryKey" | "queryFn"
  >,
) => {
  const { formatted, ...apiParams } = params as any;

  return useQuery<
    {
      data: FormattedCategory[];
      total: number;
      totalPages: number;
      currentPage: number;
    },
    Error
  >({
    queryKey: categoryKeys.paginatedFormatted(apiParams),
    queryFn: async () => {
      const response = await categoryApi.getPaginated(apiParams);
      const formattedData = formatCategories(response.data || []);
      return {
        data: formattedData,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.currentPage || 1,
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const usePaginatedCategories = (
  params: CategoryQueryParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedCategoriesResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<PaginatedCategoriesResponse, Error>({
    queryKey: categoryKeys.paginated(params),
    queryFn: async () => {
      const response = await categoryApi.getPaginated(params);
      return response;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useCategories = (
  params: CategoryQueryParams = {},
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Category[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Category[]>, Error>({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryApi.getAll(params),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useActiveCategories = (
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Category[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useCategories({ isActive: true }, options);
};

export const useRootCategories = (
  limit?: number,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Category[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useCategories({ parent: null, isActive: true, limit }, options);
};

export const useCategoryById = (
  id: string,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<CategoryWithProducts>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<CategoryWithProducts>, Error>({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
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
    queryKey: categoryKeys.detailBySlug(slug),
    queryFn: () => categoryApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useCategoryTree = (
  includeProducts: boolean = false,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<CategoryTree[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<CategoryTree[]>, Error>({
    queryKey: [...categoryKeys.tree(), { includeProducts }],
    queryFn: () => categoryApi.getTree(includeProducts),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useFeaturedCategories = (
  limit: number = 8,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<CategoryWithProducts[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<CategoryWithProducts[]>, Error>({
    queryKey: [...categoryKeys.featured(), { limit }],
    queryFn: () => categoryApi.getFeatured(limit),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useCategoryWithProducts = (
  id: string,
  page: number = 1,
  limit: number = 12,
  options?: Omit<
    UseQueryOptions<
      BaseApiResponse<{ category: Category; products: any }>,
      Error
    >,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<
    BaseApiResponse<{ category: Category; products: any }>,
    Error
  >({
    queryKey: [...categoryKeys.withProducts(id), { page, limit }],
    queryFn: () => categoryApi.getCategoryWithProducts(id, page, limit),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useCategoryStats = () => {
  const { data: categoriesData } = useActiveCategories();

  const totalProducts =
    categoriesData?.data?.reduce(
      (sum, category) => sum + (category.productCount || 0),
      0,
    ) || 0;

  const categoryCount = categoriesData?.data?.length || 0;

  return {
    totalProducts,
    categoryCount,
    categories: categoriesData?.data || [],
    isLoading: categoriesData === undefined,
  };
};

export const useCategoriesForDisplay = () => {
  const { data: categoriesData, isLoading, error } = useRootCategories(6);

  const displayCategories = categoriesData?.data
    ? formatCategories(categoriesData.data)
    : [];

  return {
    categories: displayCategories,
    isLoading,
    error,
  };
};
