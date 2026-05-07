import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { newsletterApi } from "@/lib/api/newsletter";
import { toast } from "react-hot-toast";

export const newsletterKeys = {
  all: ["newsletter"] as const,
  subscribers: () => [...newsletterKeys.all, "subscribers"] as const,
  subscribersList: (filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => [...newsletterKeys.subscribers(), filters] as const,
  subscriber: (id: string) => [...newsletterKeys.subscribers(), id] as const,
  count: () => [...newsletterKeys.all, "count"] as const,
  stats: () => [...newsletterKeys.all, "stats"] as const,
};

// ============= PUBLIC HOOKS =============

// Hook: Subscribe to newsletter
export const useSubscribeToNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      name,
      source,
    }: {
      email: string;
      name?: string;
      source?: string;
    }) => newsletterApi.subscribe(email, name, source),
    onSuccess: (response) => {
      // Invalidate count if needed
      queryClient.invalidateQueries({ queryKey: newsletterKeys.count() });

      const message = response.data.isResubscription
        ? "Welcome back! You've been resubscribed successfully."
        : "Successfully subscribed to newsletter!";

      toast.success(message, {
        duration: 3000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      // Handle duplicate subscription gracefully
      if (error.message?.includes("already subscribed")) {
        toast.error("This email is already subscribed to our newsletter.", {
          duration: 3000,
          position: "bottom-center",
        });
      } else {
        toast.error(
          error?.message || "Failed to subscribe. Please try again.",
          {
            duration: 3000,
            position: "bottom-center",
          },
        );
      }
    },
  });
};

// Hook: Unsubscribe from newsletter
export const useUnsubscribeFromNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => newsletterApi.unsubscribe(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsletterKeys.subscribers() });
      queryClient.invalidateQueries({ queryKey: newsletterKeys.count() });
      queryClient.invalidateQueries({ queryKey: newsletterKeys.stats() });

      toast.success("Successfully unsubscribed from newsletter.", {
        duration: 3000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Failed to unsubscribe. Please try again.",
        {
          duration: 3000,
          position: "bottom-center",
        },
      );
    },
  });
};

// Hook: Unsubscribe with token
export const useUnsubscribeWithToken = () => {
  return useMutation({
    mutationFn: (token: string) => newsletterApi.unsubscribeWithToken(token),
    onSuccess: () => {
      toast.success("Successfully unsubscribed from newsletter.", {
        duration: 3000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Invalid or expired unsubscribe link.", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

// ============= ADMIN HOOKS =============

// Hook: Get all subscribers (admin only)
export const useAllSubscribers = (
  filters?: {
    page?: number;
    limit?: number;
    status?: "subscribed" | "unsubscribed" | "all";
  },
  options?: Omit<UseQueryOptions, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: newsletterKeys.subscribersList(filters),
    queryFn: async () => {
      const response = await newsletterApi.getAllSubscribers(filters);
      return response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!filters?.status, // Only fetch when status is provided
    ...options,
  });
};

// Hook: Get single subscriber details (admin only)
export const useSubscriberDetails = (
  id: string,
  options?: Omit<UseQueryOptions, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: newsletterKeys.subscriber(id),
    queryFn: async () => {
      const response = await newsletterApi.getSubscriberDetails(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    ...options,
  });
};

// Hook: Delete subscriber (admin only)
export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => newsletterApi.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsletterKeys.subscribers() });
      queryClient.invalidateQueries({ queryKey: newsletterKeys.count() });
      queryClient.invalidateQueries({ queryKey: newsletterKeys.stats() });

      toast.success("Subscriber deleted successfully.", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete subscriber.", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

// Hook: Get subscriber count (admin only)
export const useSubscriberCount = (
  options?: Omit<UseQueryOptions, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: newsletterKeys.count(),
    queryFn: async () => {
      const response = await newsletterApi.getSubscriberCount();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Hook: Get subscription statistics (admin only)
export const useSubscriptionStats = (
  options?: Omit<UseQueryOptions, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: newsletterKeys.stats(),
    queryFn: async () => {
      const response = await newsletterApi.getSubscriptionStats();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

// Hook: Export subscribers as CSV (admin only)
export const useExportSubscribersCSV = () => {
  return useMutation({
    mutationFn: () => newsletterApi.exportSubscribersCSV(),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Subscribers exported successfully.", {
        duration: 2000,
        position: "bottom-center",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to export subscribers.", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};

// Hook: Send bulk newsletter (admin only)
export const useSendBulkNewsletter = () => {
  return useMutation({
    mutationFn: ({
      subject,
      content,
      contentType,
    }: {
      subject: string;
      content: string;
      contentType?: "html" | "text";
    }) => newsletterApi.sendBulkNewsletter(subject, content, contentType),
    onSuccess: (response) => {
      const { sent, total, failed } = response.data;
      toast.success(
        `Newsletter sent! ${sent} of ${total} delivered. ${failed} failed.`,
        {
          duration: 5000,
          position: "bottom-center",
        },
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send newsletter.", {
        duration: 3000,
        position: "bottom-center",
      });
    },
  });
};
