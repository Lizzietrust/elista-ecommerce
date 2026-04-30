import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { typedApiClient, BaseApiResponse } from "@/lib/api/client";

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  rating: number;
  title?: string;
  comment: string;
  images?: Array<{ url: string; public_id?: string; caption?: string }>;
  verifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  edited: boolean;
  editedAt?: string;
  status: "active" | "flagged" | "hidden" | "removed";
  formattedDate?: string;
  timeAgo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingDistribution {
  count: number;
  percentage: number;
}

export interface ReviewStatistics {
  averageRating: string | number;
  totalReviews: number;
  ratingDistribution: {
    1: RatingDistribution;
    2: RatingDistribution;
    3: RatingDistribution;
    4: RatingDistribution;
    5: RatingDistribution;
  };
}

export interface ProductReviewsResponse {
  success: boolean;
  product: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
  statistics: ReviewStatistics;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: Review[];
}

export interface ReviewsResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  averageRating: string | null;
  ratingCounts: Record<number, number> | null;
  data: Review[];
}

export interface CreateReviewPayload {
  product: string;
  rating: number;
  comment: string;
  title?: string;
  images?: Array<{ url: string; public_id?: string; caption?: string }>;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
  title?: string;
  images?: Array<{ url: string }>;
  isHelpful?: boolean;
  isNotHelpful?: boolean;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  rating?: number;
  sort?: string;
  verified?: boolean;
  hasImages?: boolean;
}

export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (filters: ReviewQueryParams) =>
    [...reviewKeys.lists(), filters] as const,
  byProduct: (productId: string, filters?: ReviewQueryParams) =>
    [...reviewKeys.all, "product", productId, filters] as const,
  byUser: (userId: string) => [...reviewKeys.all, "user", userId] as const,
  mine: () => [...reviewKeys.all, "mine"] as const,
  detail: (id: string) => [...reviewKeys.all, "detail", id] as const,
  recent: (limit?: number) => [...reviewKeys.all, "recent", { limit }] as const,
  helpful: (limit?: number) =>
    [...reviewKeys.all, "helpful", { limit }] as const,
};

export const reviewApi = {
  getProductReviews: async (
    productId: string,
    params: ReviewQueryParams = {},
  ): Promise<ProductReviewsResponse> => {
    return typedApiClient.get<ProductReviewsResponse>(
      `/reviews/product/${productId}`,
      { params },
    );
  },

  getReviewById: async (id: string): Promise<BaseApiResponse<Review>> => {
    return typedApiClient.get<BaseApiResponse<Review>>(`/reviews/${id}`);
  },

  getMyReviews: async (
    params: ReviewQueryParams = {},
  ): Promise<ReviewsResponse> => {
    return typedApiClient.get<ReviewsResponse>("/reviews/me", { params });
  },

  getUserReviews: async (
    userId: string,
    params: ReviewQueryParams = {},
  ): Promise<ReviewsResponse> => {
    return typedApiClient.get<ReviewsResponse>(`/reviews/user/${userId}`, {
      params,
    });
  },

  getRecentReviews: async (
    limit: number = 10,
  ): Promise<BaseApiResponse<Review[]>> => {
    return typedApiClient.get<BaseApiResponse<Review[]>>("/reviews/recent", {
      params: { limit },
    });
  },

  getHelpfulReviews: async (
    limit: number = 10,
  ): Promise<BaseApiResponse<Review[]>> => {
    return typedApiClient.get<BaseApiResponse<Review[]>>("/reviews/helpful", {
      params: { limit },
    });
  },

  createReview: async (
    payload: CreateReviewPayload,
  ): Promise<BaseApiResponse<Review>> => {
    return typedApiClient.post<BaseApiResponse<Review>>("/reviews", payload);
  },

  updateReview: async (
    id: string,
    payload: UpdateReviewPayload,
  ): Promise<BaseApiResponse<Review>> => {
    return typedApiClient.put<BaseApiResponse<Review>>(
      `/reviews/${id}`,
      payload,
    );
  },

  deleteReview: async (id: string): Promise<BaseApiResponse<null>> => {
    return typedApiClient.delete<BaseApiResponse<null>>(`/reviews/${id}`);
  },

  reportReview: async (
    id: string,
    payload: { reason: string; description?: string },
  ): Promise<BaseApiResponse<{ reportCount: number; status: string }>> => {
    return typedApiClient.post<
      BaseApiResponse<{ reportCount: number; status: string }>
    >(`/reviews/${id}/report`, payload);
  },
};

export const useProductReviews = (
  productId: string,
  params: ReviewQueryParams = {},
  options?: Omit<
    UseQueryOptions<ProductReviewsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ProductReviewsResponse, Error>({
    queryKey: reviewKeys.byProduct(productId, params),
    queryFn: () => reviewApi.getProductReviews(productId, params),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useReview = (
  id: string,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Review>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Review>, Error>({
    queryKey: reviewKeys.detail(id),
    queryFn: () => reviewApi.getReviewById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useMyReviews = (
  params: ReviewQueryParams = {},
  options?: Omit<
    UseQueryOptions<ReviewsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ReviewsResponse, Error>({
    queryKey: [...reviewKeys.mine(), params],
    queryFn: () => reviewApi.getMyReviews(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useUserReviews = (
  userId: string,
  params: ReviewQueryParams = {},
  options?: Omit<
    UseQueryOptions<ReviewsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<ReviewsResponse, Error>({
    queryKey: reviewKeys.byUser(userId),
    queryFn: () => reviewApi.getUserReviews(userId, params),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useRecentReviews = (
  limit: number = 10,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Review[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Review[]>, Error>({
    queryKey: reviewKeys.recent(limit),
    queryFn: () => reviewApi.getRecentReviews(limit),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useHelpfulReviews = (
  limit: number = 10,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Review[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Review[]>, Error>({
    queryKey: reviewKeys.helpful(limit),
    queryFn: () => reviewApi.getHelpfulReviews(limit),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useCreateReview = (
  options?: UseMutationOptions<
    BaseApiResponse<Review>,
    Error,
    CreateReviewPayload
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseApiResponse<Review>, Error, CreateReviewPayload>({
    mutationFn: (payload) => reviewApi.createReview(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.byProduct(variables.product),
      });
      queryClient.invalidateQueries({ queryKey: reviewKeys.mine() });
    },
    ...options,
  });
};

export const useUpdateReview = (
  options?: UseMutationOptions<
    BaseApiResponse<Review>,
    Error,
    { id: string; payload: UpdateReviewPayload }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    BaseApiResponse<Review>,
    Error,
    { id: string; payload: UpdateReviewPayload }
  >({
    mutationFn: ({ id, payload }) => reviewApi.updateReview(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
    ...options,
  });
};

export const useDeleteReview = (
  options?: UseMutationOptions<BaseApiResponse<null>, Error, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<BaseApiResponse<null>, Error, string>({
    mutationFn: (id) => reviewApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
    ...options,
  });
};

export const useMarkReviewHelpful = (
  options?: UseMutationOptions<
    BaseApiResponse<Review>,
    Error,
    { id: string; isHelpful: boolean }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<
    BaseApiResponse<Review>,
    Error,
    { id: string; isHelpful: boolean }
  >({
    mutationFn: ({ id, isHelpful }) =>
      reviewApi.updateReview(id, { isHelpful }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.id),
      });
    },
    ...options,
  });
};

export const useReportReview = (
  options?: UseMutationOptions<
    BaseApiResponse<{ reportCount: number; status: string }>,
    Error,
    { id: string; reason: string; description?: string }
  >,
) => {
  return useMutation<
    BaseApiResponse<{ reportCount: number; status: string }>,
    Error,
    { id: string; reason: string; description?: string }
  >({
    mutationFn: ({ id, reason, description }) =>
      reviewApi.reportReview(id, { reason, description }),
    ...options,
  });
};
