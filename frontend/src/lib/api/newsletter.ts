import {
  typedApiClient,
  BaseApiResponse,
  PaginatedApiResponse,
} from "./client";

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  subscribedAt: string;
  unsubscribedAt?: string;
  source: "newsletter_form" | "checkout" | "footer" | "other";
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeResponse {
  email: string;
  subscribedAt: string;
  isResubscription?: boolean;
}

export interface SubscriberCountResponse {
  active: number;
  total: number;
  newThisMonth: number;
}

export interface SubscriptionStatsResponse {
  totals: {
    all: number;
    active: number;
    unsubscribed: number;
  };
  newSubscriptions: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  sources: Record<string, number>;
}

export interface BulkNewsletterResponse {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

export const newsletterApi = {
  // Public endpoints
  subscribe: async (email: string, name?: string, source?: string) => {
    return typedApiClient.post<BaseApiResponse<SubscribeResponse>>(
      "/newsletter/subscribe",
      { email, name, source },
    );
  },

  unsubscribe: async (email: string) => {
    return typedApiClient.post<BaseApiResponse<{ message: string }>>(
      "/newsletter/unsubscribe",
      { email },
    );
  },

  unsubscribeWithToken: async (token: string) => {
    return typedApiClient.get<BaseApiResponse<{ message: string }>>(
      `/newsletter/unsubscribe/${token}`,
    );
  },

  // Admin endpoints (protected)
  getAllSubscribers: async (params?: {
    page?: number;
    limit?: number;
    status?: "subscribed" | "unsubscribed" | "all";
  }) => {
    return typedApiClient.get<PaginatedApiResponse<NewsletterSubscriber>>(
      "/newsletter/subscribers",
      { params },
    );
  },

  getSubscriberDetails: async (id: string) => {
    return typedApiClient.get<BaseApiResponse<NewsletterSubscriber>>(
      `/newsletter/subscribers/${id}`,
    );
  },

  deleteSubscriber: async (id: string) => {
    return typedApiClient.delete<BaseApiResponse<{ message: string }>>(
      `/newsletter/subscribers/${id}`,
    );
  },

  getSubscriberCount: async () => {
    return typedApiClient.get<BaseApiResponse<SubscriberCountResponse>>(
      "/newsletter/count",
    );
  },

  getSubscriptionStats: async () => {
    return typedApiClient.get<BaseApiResponse<SubscriptionStatsResponse>>(
      "/newsletter/stats",
    );
  },

  exportSubscribersCSV: async () => {
    return typedApiClient.get<Blob>("/newsletter/export", {
      responseType: "blob",
    });
  },

  sendBulkNewsletter: async (
    subject: string,
    content: string,
    contentType?: "html" | "text",
  ) => {
    return typedApiClient.post<BaseApiResponse<BulkNewsletterResponse>>(
      "/newsletter/broadcast",
      { subject, content, contentType },
    );
  },
};
