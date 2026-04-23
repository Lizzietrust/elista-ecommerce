// lib/api/client.ts (FRONTEND - Fully fixed version)
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

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the data part - we need to cast it to maintain TypeScript types
    return response.data;
  },
  (error: AxiosError<ErrorResponseData>) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          console.error("Unauthorized access");
          if (typeof window !== "undefined") {
            // Only redirect if not already on login page
            if (!window.location.pathname.includes("/login")) {
              window.location.href = "/login";
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
