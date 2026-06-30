import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  cartApi,
  CartResponse,
  CartItem,
  CartCountResponse,
} from "@/lib/api/cart";
import { toast } from "react-hot-toast";

export const cartKeys = {
  all: ["cart"] as const,
  details: () => [...cartKeys.all, "detail"] as const,
  detail: () => [...cartKeys.details()] as const,
  summary: () => [...cartKeys.all, "summary"] as const,
  count: () => [...cartKeys.all, "count"] as const,
};

export const useCart = (
  options?: Omit<
    UseQueryOptions<CartResponse | null, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<CartResponse | null, Error>({
    queryKey: cartKeys.detail(),
    queryFn: async () => {
      try {
        const response = await cartApi.getCart();

        if (response && response.data) {
          return response.data;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    ...options,
  });
};

export const useCartCount = (
  options?: Omit<
    UseQueryOptions<CartCountResponse | null, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery<CartCountResponse | null, Error>({
    queryKey: cartKeys.count(),
    queryFn: async () => {
      try {
        const response = await cartApi.getCartCount();
        return response.data || { itemCount: 0, productCount: 0 };
      } catch (error) {
        return { itemCount: 0, productCount: 0 };
      }
    },
    staleTime: 1000 * 60 * 1,
    gcTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => cartApi.addToCart(productId, quantity),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      toast.success("Added to cart!", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add to cart", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useUpdateCartItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItemQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update quantity", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useIncrementCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.incrementCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update quantity", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useDecrementCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.decrementCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update quantity", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      toast.success("Removed from cart", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to remove from cart", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      toast.success("Cart cleared", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to clear cart", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponCode: string) => cartApi.applyCoupon(couponCode),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      const couponCode = response.data?.coupon?.code || "coupon";
      toast.success(`Coupon "${couponCode}" applied!`, {
        duration: 3000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to apply coupon", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      toast.success("Coupon removed", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to remove coupon", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useMoveToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.moveToWishlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });

      toast.success("Moved to wishlist", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to move to wishlist", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useMergeCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestCart: Array<{ productId: string; quantity: number }>) =>
      cartApi.mergeCart(guestCart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      queryClient.invalidateQueries({ queryKey: cartKeys.count() });
      queryClient.invalidateQueries({ queryKey: cartKeys.summary() });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to merge cart", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

export const useAvailableCoupons = () => {
  return useQuery({
    queryKey: ["available-coupons"],
    queryFn: async () => {
      try {
        const response = await cartApi.getAvailableCoupons();
        return response.data || [];
      } catch (error) {
        console.error("Error fetching available coupons:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};
