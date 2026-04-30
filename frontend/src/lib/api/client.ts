import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ErrorResponseData {
  success: boolean;
  message?: string;
  error?: string;
  errors?: any[];
  [key: string]: any;
}

// Define base API response type
export interface BaseApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
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

// Create axios instance with proper typing
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // ✅ FIX: Add timestamp to GET requests to prevent caching
    if (config.method?.toLowerCase() === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(), // Current timestamp to bust cache
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Define public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  "/api/products",
  "/api/categories",
  "/api/brands",
  "/api/search",
  "/api/reviews",
  "/api/product",
];

// Helper function to check if an endpoint is public
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the data part - we need to cast it to maintain TypeScript types
    return response.data;
  },
  async (error: AxiosError<ErrorResponseData>) => {
    const { response, config } = error;

    // Get the original request config
    const originalRequest = config as AxiosRequestConfig & { _retry?: boolean };

    if (response) {
      switch (response.status) {
        case 401:
          // Check if this is a public endpoint that should silently fail
          if (isPublicEndpoint(originalRequest?.url)) {
            console.debug(
              "Unauthorized access on public endpoint, continuing normally",
            );
            // Return empty/default data for public endpoints
            return Promise.reject({
              status: response.status,
              message: "Authentication required for this operation",
              data: response?.data,
              isPublicEndpoint: true,
            });
          }

          // For protected endpoints, handle authentication
          console.error("Unauthorized access on protected endpoint");

          if (typeof window !== "undefined") {
            // Clear invalid token if it exists
            localStorage.removeItem("token");

            // Only redirect for protected routes that need auth
            // Don't redirect for product browsing, etc.
            const protectedRoutes = [
              "/checkout",
              "/profile",
              "/orders",
              "/wishlist",
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
    });
  },
);

// Generic API request function with proper typing
export async function apiRequest<T = any>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient(config);
  return response as T;
}

// Typed API client that preserves types through the interceptor
export const typedApiClient = {
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiRequest<T>({ method: "GET", url, ...config });
  },
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiRequest<T>({ method: "POST", url, data, ...config });
  },
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiRequest<T>({ method: "PUT", url, data, ...config });
  },
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiRequest<T>({ method: "PATCH", url, data, ...config });
  },
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiRequest<T>({ method: "DELETE", url, ...config });
  },
};

// Helper function to handle authentication-optional API calls
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
    // If it's a 401 error on a public endpoint, return empty data instead of failing
    if (error.status === 401 && error.isPublicEndpoint) {
      return { data: null, isAuthenticated: false };
    }
    throw error;
  }
}
