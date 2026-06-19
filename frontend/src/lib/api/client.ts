import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ErrorResponseData {
  success: boolean;
  message?: string;
  error?: string;
  errors?: any[];
  [key: string]: any;
}

export interface BaseApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  token?: string;
  user?: any;
  [key: string]: any;
}

export interface PaginatedApiResponse<T = any> {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: T[];
  filters?: any;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  [key: string]: any;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const shouldAddTimestamp =
      config.method?.toLowerCase() === "get" &&
      !config.url?.includes("/new-arrivals") &&
      !config.url?.includes("/products") &&
      !config.url?.includes("/categories");

    if (shouldAddTimestamp) {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const PUBLIC_ENDPOINTS = [
  "/api/products",
  "/api/categories",
  "/api/brands",
  "/api/search",
  "/api/reviews",
  "/api/product",
  "/api/products/new-arrivals",
  "/api/products/featured",
  "/api/products/best-sellers",
  "/api/products/search",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
];

const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  const path = url.split("?")[0];
  return PUBLIC_ENDPOINTS.some((endpoint) => path.includes(endpoint));
};

apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API ${response.config.method?.toUpperCase()} ${response.config.url}:`,
        response.data,
      );
    }
    return response;
  },
  async (error: AxiosError<ErrorResponseData>) => {
    const { response, config } = error;
    const originalRequest = config as AxiosRequestConfig & { _retry?: boolean };

    if (response) {
      console.error(`API Error ${response.status}:`, response.data);

      switch (response.status) {
        case 401:
          if (!config?.url?.includes("/auth/")) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
            }
          }

          if (isPublicEndpoint(originalRequest?.url)) {
            console.debug("Public endpoint accessed without auth");
            return Promise.reject({
              status: response.status,
              message: response.data?.message || "Authentication required",
              isPublicEndpoint: true,
            });
          }

          console.error("Unauthorized access on protected endpoint");

          if (typeof window !== "undefined") {
            const protectedRoutes = [
              "/checkout",
              "/profile",
              "/orders",
              "/wishlist",
              "/cart",
              "/account",
            ];
            const currentPath = window.location.pathname;

            if (protectedRoutes.some((route) => currentPath.includes(route))) {
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          }
          break;
        case 403:
          console.error("Forbidden access");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 429:
          console.error("Too many requests");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("An error occurred");
      }
    }

    const errorMessage =
      response?.data?.message ||
      response?.data?.error ||
      error.message ||
      "An unknown error occurred";

    return Promise.reject({
      status: response?.status,
      message: errorMessage,
      data: response?.data,
      isPublicEndpoint: isPublicEndpoint(originalRequest?.url),
    });
  },
);

export async function apiRequest<T = any>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient(config);
  return response.data as T;
}

export const typedApiClient = {
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export async function optionalAuthRequest<T = any>(
  url: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    data?: any;
    config?: AxiosRequestConfig;
  },
): Promise<{ data: T | null; isAuthenticated: boolean; error?: any }> {
  try {
    const method = options?.method || "GET";
    const response = await typedApiClient[
      method.toLowerCase() as keyof typeof typedApiClient
    ](url, options?.data, options?.config);
    return { data: response as T, isAuthenticated: true };
  } catch (error: any) {
    if (error.status === 401 && error.isPublicEndpoint) {
      console.log(`Public endpoint ${url} returned 401, returning empty data`);
      return { data: null, isAuthenticated: false };
    }
    throw error;
  }
}

export async function safeApiCall<T = any>(
  apiCall: () => Promise<T>,
  fallbackData?: T,
): Promise<{ data: T | null; error: any | null }> {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    console.error("API call failed:", error);
    return { data: fallbackData || null, error };
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiClient.get("/health", { timeout: 5000 });
    return true;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}
