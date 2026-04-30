import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  categoryApi,
  Category,
  CategoryWithProducts,
  CategoryTree,
  CategoryQueryParams,
} from "@/lib/api/categories";
import { BaseApiResponse } from "../api/client";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params: CategoryQueryParams) =>
    [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  detailBySlug: (slug: string) =>
    [...categoryKeys.details(), "slug", slug] as const,
  tree: () => [...categoryKeys.all, "tree"] as const,
  featured: () => [...categoryKeys.all, "featured"] as const,
  withProducts: (id: string) =>
    [...categoryKeys.all, "with-products", id] as const,
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
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Category[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useCategories({ parent: null, isActive: true }, options);
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

// Transform categories for UI display (like the CategoryGrid component)
export const useCategoriesForDisplay = () => {
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useRootCategories({ limit: 6 });

  const displayCategories = categoriesData?.data?.map((category, index) => {
    // Define gradients based on category name or index
    const gradients = [
      "from-[#2C3E3E] to-[#4A6B6B]",
      "from-[#C17B4D] to-[#D49A6A]",
      "from-[#6B8E6B] to-[#8BAA8B]",
      "from-[#D4C4B7] to-[#E8DED5]",
      "from-[#C17B7B] to-[#D49A9A]",
      "from-[#8B6B4D] to-[#A88B6D]",
    ];

    // Icons based on category name
    const iconMap: Record<string, string> = {
      Electronics: "⚡",
      Fashion: "👗",
      "Home & Garden": "🏡",
      Sports: "⚽",
      Beauty: "💄",
      Books: "📚",
      "Home Office": "💼",
      Lighting: "💡",
      "Storage & Organization": "📦",
      "Decor & Accessories": "🎨",
    };

    return {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      count: category.productCount,
      gradient: gradients[index % gradients.length],
      icon: iconMap[category.name] || "🛍️",
      image: category.image?.url,
    };
  });

  return {
    categories: displayCategories || [],
    isLoading,
    error,
  };
};
