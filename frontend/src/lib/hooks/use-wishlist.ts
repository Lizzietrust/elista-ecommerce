import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  wishlistApi,
  WishlistResponse,
  AddToWishlistResponse,
  WishlistItem,
} from "@/lib/api/wishlist";
import { Product } from "@/lib/api/products";
import { toast } from "react-hot-toast";

export const wishlistKeys = {
  all: ["wishlist"] as const,
  details: () => [...wishlistKeys.all, "detail"] as const,
  detail: (filters?: { populate?: boolean; sort?: string }) =>
    [...wishlistKeys.details(), filters] as const,
  count: () => [...wishlistKeys.all, "count"] as const,
  check: (productId: string) =>
    [...wishlistKeys.all, "check", productId] as const,
  share: () => [...wishlistKeys.all, "share"] as const,
};

export const useWishlist = (
  options?: Omit<
    UseQueryOptions<WishlistResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<WishlistResponse, Error>({
    queryKey: wishlistKeys.detail({ populate: true, sort: "-addedAt" }),
    queryFn: async () => {
      const response = await wishlistApi.getWishlist({
        populate: true,
        sort: "-addedAt",
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};

export const useCheckInWishlist = (
  productId: string,
  options?: Omit<
    UseQueryOptions<
      { isInWishlist: boolean; itemDetails?: WishlistItem },
      Error
    >,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<{ isInWishlist: boolean; itemDetails?: WishlistItem }, Error>(
    {
      queryKey: wishlistKeys.check(productId),
      queryFn: async () => {
        const response = await wishlistApi.checkInWishlist(productId);

        return response.data;
      },
      enabled: !!productId,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      ...options,
    },
  );
};

export const useWishlistCount = () => {
  return useQuery({
    queryKey: wishlistKeys.count(),
    queryFn: async () => {
      const response = await wishlistApi.getWishlistCount();
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      options,
    }: {
      productId: string;
      options?: { notes?: string; priority?: string; variant?: string };
    }) => wishlistApi.addToWishlist(productId, options),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.details() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.count() });
      queryClient.invalidateQueries({
        queryKey: wishlistKeys.check(variables.productId),
      });

      toast.success("Added to wishlist!", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add to wishlist", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      wishlistApi.removeFromWishlist(productId),
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.details() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.count() });
      queryClient.invalidateQueries({
        queryKey: wishlistKeys.check(productId),
      });

      toast.success("Removed from wishlist", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to remove from wishlist", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: addToWishlist } = useAddToWishlist();
  const { mutateAsync: removeFromWishlist } = useRemoveFromWishlist();

  return useMutation({
    mutationFn: async ({
      product,
      isInWishlist,
    }: {
      product: Product;
      isInWishlist: boolean;
    }) => {
      if (isInWishlist) {
        await removeFromWishlist(product._id);
        return { action: "removed", productId: product._id };
      } else {
        await addToWishlist({ productId: product._id });
        return { action: "added", productId: product._id };
      }
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.details() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.count() });

      toast.success("Wishlist cleared", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to clear wishlist", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useUpdateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      updates,
    }: {
      productId: string;
      updates: { notes?: string; priority?: string };
    }) => wishlistApi.updateWishlistItem(productId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.details() });

      toast.success("Wishlist item updated", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update wishlist item", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useMoveToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity?: number;
    }) => wishlistApi.moveToCart(productId, quantity),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.details() });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.count() });
      queryClient.invalidateQueries({
        queryKey: wishlistKeys.check(productId),
      });

      toast.success("Moved to cart", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to move to cart", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useGenerateShareLink = () => {
  return useMutation({
    mutationFn: (expiryDays?: number) =>
      wishlistApi.generateShareLink(expiryDays),
    onSuccess: (response) => {
      toast.success("Share link generated!", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to generate share link", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useRevokeShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistApi.revokeShareLink(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.share() });

      toast.success("Share link revoked", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to revoke share link", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};
