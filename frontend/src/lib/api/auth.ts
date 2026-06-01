import { typedApiClient, BaseApiResponse } from "./client";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  UpdateProfileData,
  UpdatePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  AddAddressData,
  UpdateAddressData,
  UserProfileResponse,
  AddressResponse,
  WishlistResponse,
} from "@/types/auth";

export const authApi = {
  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await typedApiClient.post<AuthResponse>(
      "/auth/register",
      data,
    );
    return response;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await typedApiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );
    return response;
  },

  logout: async (): Promise<BaseApiResponse<null>> => {
    const response =
      await typedApiClient.get<BaseApiResponse<null>>("/auth/logout");
    return response;
  },

  getMe: async (): Promise<AuthResponse> => {
    const response = await typedApiClient.get<AuthResponse>("/auth/me");
    return response;
  },

  updateDetails: async (data: UpdateProfileData): Promise<AuthResponse> => {
    const response = await typedApiClient.put<AuthResponse>(
      "/auth/updatedetails",
      data,
    );
    return response;
  },

  updatePassword: async (data: UpdatePasswordData): Promise<AuthResponse> => {
    const response = await typedApiClient.put<AuthResponse>(
      "/auth/updatepassword",
      data,
    );
    return response;
  },

  forgotPassword: async (
    data: ForgotPasswordData,
  ): Promise<BaseApiResponse<null>> => {
    const response = await typedApiClient.post<BaseApiResponse<null>>(
      "/auth/forgot-password",
      data,
    );
    return response;
  },

  resetPassword: async (
    token: string,
    data: ResetPasswordData,
  ): Promise<AuthResponse> => {
    const response = await typedApiClient.put<AuthResponse>(
      `/auth/reset-password/${token}`,
      data,
    );
    return response;
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await typedApiClient.get<AuthResponse>(
      `/auth/verify-email/${token}`,
    );
    return response;
  },

  resendVerificationEmail: async (
    email: string,
  ): Promise<BaseApiResponse<null>> => {
    const response = await typedApiClient.post<BaseApiResponse<null>>(
      "/auth/resend-verification",
      { email },
    );
    return response;
  },
};

export const userApi = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const response =
      await typedApiClient.get<UserProfileResponse>("/users/profile");
    return response;
  },

  updateProfile: async (
    data: UpdateProfileData,
  ): Promise<{ success: boolean; data: User; message?: string }> => {
    const response = await typedApiClient.put<{
      success: boolean;
      data: User;
      message?: string;
    }>("/users/profile", data);
    return response;
  },

  updatePreferences: async (
    preferences: Partial<User["preferences"]>,
  ): Promise<{
    success: boolean;
    data: User["preferences"];
    message?: string;
  }> => {
    const response = await typedApiClient.put<{
      success: boolean;
      data: User["preferences"];
      message?: string;
    }>("/users/preferences", preferences);
    return response;
  },

  getAddresses: async (): Promise<AddressResponse> => {
    const response =
      await typedApiClient.get<AddressResponse>("/users/addresses");
    return response;
  },

  addAddress: async (data: AddAddressData): Promise<AddressResponse> => {
    const response = await typedApiClient.post<AddressResponse>(
      "/users/addresses",
      data,
    );
    return response;
  },

  updateAddress: async (
    addressId: string,
    data: UpdateAddressData,
  ): Promise<AddressResponse> => {
    const response = await typedApiClient.put<AddressResponse>(
      `/users/addresses/${addressId}`,
      data,
    );
    return response;
  },

  deleteAddress: async (addressId: string): Promise<AddressResponse> => {
    const response = await typedApiClient.delete<AddressResponse>(
      `/users/addresses/${addressId}`,
    );
    return response;
  },

  setDefaultAddress: async (addressId: string): Promise<AddressResponse> => {
    const response = await typedApiClient.patch<AddressResponse>(
      `/users/addresses/${addressId}/default`,
    );
    return response;
  },

  getWishlist: async (): Promise<WishlistResponse> => {
    const response =
      await typedApiClient.get<WishlistResponse>("/users/wishlist");
    return response;
  },

  addToWishlist: async (productId: string): Promise<WishlistResponse> => {
    const response = await typedApiClient.post<WishlistResponse>(
      `/users/wishlist/${productId}`,
    );
    return response;
  },

  removeFromWishlist: async (productId: string): Promise<WishlistResponse> => {
    const response = await typedApiClient.delete<WishlistResponse>(
      `/users/wishlist/${productId}`,
    );
    return response;
  },
};
