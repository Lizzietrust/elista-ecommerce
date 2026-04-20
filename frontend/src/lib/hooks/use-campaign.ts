import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { BaseApiResponse } from "../api/client";

export interface Campaign {
  _id: string;
  name: string;
  slug: string;
  type: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerText?: string;
  bannerColor?: string;
  displayOnHomepage: boolean;
  displayOnProductPage: boolean;
  applyToAll?: boolean;
  eligibleProducts?: string[];
  eligibleCategories?: string[];
  maximumDiscount?: number;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: string;
}

export interface UseCampaignReturn {
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
  timeRemaining: TimeRemaining | null;
  isProductEligible: (product: any) => boolean;
  getDiscountedPrice: (originalPrice: number, product?: any) => number;
  activeCampaignsQuery: ReturnType<typeof useActiveCampaigns>;
  campaignByIdQuery: ReturnType<typeof useCampaignById>;
  campaignBySlugQuery: ReturnType<typeof useCampaignBySlug>;
}

export const campaignKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, "detail"] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  active: () => [...campaignKeys.all, "active"] as const,
  bySlug: (slug: string) => [...campaignKeys.all, "slug", slug] as const,
};

export const campaignApi = {
  getActiveCampaigns: async (): Promise<BaseApiResponse<Campaign[]>> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/campaigns/active`,
    );
    return response.data;
  },

  getCampaignById: async (id: string): Promise<BaseApiResponse<Campaign>> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${id}`,
    );
    return response.data;
  },

  getCampaignBySlug: async (
    slug: string,
  ): Promise<BaseApiResponse<Campaign>> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/campaigns/slug/${slug}`,
    );
    return response.data;
  },

  getAllCampaigns: async (params?: {
    isActive?: boolean;
    type?: string;
  }): Promise<BaseApiResponse<Campaign[]>> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/campaigns`,
      { params },
    );
    return response.data;
  },
};

export const useActiveCampaigns = (
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Campaign[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Campaign[]>, Error>({
    queryKey: campaignKeys.active(),
    queryFn: () => campaignApi.getActiveCampaigns(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useCampaignById = (
  id: string,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Campaign>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Campaign>, Error>({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignApi.getCampaignById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useCampaignBySlug = (
  slug: string,
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Campaign>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Campaign>, Error>({
    queryKey: campaignKeys.bySlug(slug),
    queryFn: () => campaignApi.getCampaignBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    ...options,
  });
};

export const useAllCampaigns = (
  params?: {
    isActive?: boolean;
    type?: string;
  },
  options?: Omit<
    UseQueryOptions<BaseApiResponse<Campaign[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<BaseApiResponse<Campaign[]>, Error>({
    queryKey: campaignKeys.list(params),
    queryFn: () => campaignApi.getAllCampaigns(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useCampaign = (options?: {
  autoSelectHighestPriority?: boolean;
  campaignId?: string;
  campaignSlug?: string;
}): UseCampaignReturn => {
  const {
    autoSelectHighestPriority = true,
    campaignId,
    campaignSlug,
  } = options || {};

  const activeCampaignsQuery = useActiveCampaigns({
    enabled: !campaignId && !campaignSlug,
  });

  const campaignByIdQuery = useCampaignById(campaignId || "", {
    enabled: !!campaignId,
  });

  const campaignBySlugQuery = useCampaignBySlug(campaignSlug || "", {
    enabled: !!campaignSlug && !campaignId,
  });

  let activeCampaign: Campaign | null = null;
  let isLoading = false;
  let error: Error | null = null;

  if (campaignId && campaignByIdQuery.data?.success) {
    activeCampaign = campaignByIdQuery.data.data;
    isLoading = campaignByIdQuery.isLoading;
    error = campaignByIdQuery.error;
  } else if (campaignSlug && campaignBySlugQuery.data?.success) {
    activeCampaign = campaignBySlugQuery.data.data;
    isLoading = campaignBySlugQuery.isLoading;
    error = campaignBySlugQuery.error;
  } else if (activeCampaignsQuery.data?.success) {
    const campaigns = activeCampaignsQuery.data.data;
    if (autoSelectHighestPriority && campaigns.length > 0) {
      activeCampaign = campaigns[0];
    }
    isLoading = activeCampaignsQuery.isLoading;
    error = activeCampaignsQuery.error;
  }

  const calculateTimeRemaining = (
    campaign: Campaign | null,
  ): TimeRemaining | null => {
    if (!campaign) return null;

    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    let total = "";
    if (days > 0) total = `${days}d ${hours}h ${minutes}m`;
    else if (hours > 0) total = `${hours}h ${minutes}m ${seconds}s`;
    else total = `${minutes}m ${seconds}s`;

    return { days, hours, minutes, seconds, total };
  };

  const timeRemaining = calculateTimeRemaining(activeCampaign);

  const isProductEligible = (product: any): boolean => {
    if (!activeCampaign) return false;

    if (activeCampaign.applyToAll) return true;

    if (activeCampaign.eligibleProducts?.includes(product._id)) return true;

    if (activeCampaign.eligibleCategories?.includes(product.category))
      return true;

    return false;
  };

  const getDiscountedPrice = (originalPrice: number, product?: any): number => {
    if (!activeCampaign) return originalPrice;
    if (product && !isProductEligible(product)) return originalPrice;

    let discount = 0;
    if (activeCampaign.discountType === "percentage") {
      discount = (originalPrice * activeCampaign.discountValue) / 100;
    } else {
      discount = activeCampaign.discountValue;
    }

    if (
      activeCampaign.maximumDiscount &&
      discount > activeCampaign.maximumDiscount
    ) {
      discount = activeCampaign.maximumDiscount;
    }

    const finalPrice = originalPrice - discount;
    return finalPrice > 0 ? finalPrice : 0;
  };

  return {
    activeCampaign,
    campaigns: activeCampaignsQuery.data?.data || [],
    isLoading,
    error,
    timeRemaining,

    isProductEligible,
    getDiscountedPrice,

    activeCampaignsQuery,
    campaignByIdQuery,
    campaignBySlugQuery,
  };
};
