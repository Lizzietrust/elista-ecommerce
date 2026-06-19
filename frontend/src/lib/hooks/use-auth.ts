import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, userApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import type {
  LoginCredentials,
  RegisterCredentials,
  UpdateProfileData,
  UpdatePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  AddAddressData,
  UpdateAddressData,
} from "@/types/auth";
import { toast } from "react-hot-toast";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  addresses: () => [...authKeys.all, "addresses"] as const,
  address: (id: string) => [...authKeys.addresses(), id] as const,
  wishlist: () => [...authKeys.all, "wishlist"] as const,
  preferences: () => [...authKeys.all, "preferences"] as const,
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      console.log("Login mutation success:", data);

      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        queryClient.setQueryData(authKeys.me(), data.user);
      }

      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      console.error("Login mutation error:", error);
      const errorMessage = error?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterCredentials) => authApi.register(data),
    onSuccess: (data) => {
      console.log("Register mutation success:", data);

      if (data && data.token && typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }

      if (data && data.user) {
        queryClient.setQueryData(authKeys.me(), data.user);
      }

      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success("Registration successful! Welcome to Elista.");
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      const errorMessage =
        error?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      console.log("Logout successful");

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        sessionStorage.clear();
      }

      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();

      toast.success("Logged out successfully");
      router.push("/");
    },
    onError: (error: any) => {
      console.error("Logout error:", error);

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
      router.push("/");
    },
  });
};

export const useCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        const response = await authApi.getMe();
        console.log("Current user response:", response);
        return response.user;
      } catch (error) {
        console.error("Error fetching current user:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    ...options,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
    onError: (error: any) => {
      console.error("Forgot password error:", error);
      const errorMessage =
        error?.message || "Failed to send reset email. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: ResetPasswordData }) =>
      authApi.resetPassword(token, data),
    onSuccess: () => {
      toast.success(
        "Password reset successfully! Please login with your new password.",
      );
    },
    onError: (error: any) => {
      console.error("Reset password error:", error);
      const errorMessage =
        error?.message || "Failed to reset password. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: (data) => {
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("token", data.token);
      }
      queryClient.setQueryData(authKeys.me(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success("Email verified successfully!");
    },
    onError: (error: any) => {
      console.error("Email verification error:", error);
      const errorMessage =
        error?.message || "Failed to verify email. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerificationEmail(email),
    onSuccess: () => {
      toast.success("Verification email resent successfully!");
    },
    onError: (error: any) => {
      console.error("Resend verification error:", error);
      const errorMessage =
        error?.message ||
        "Failed to resend verification email. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const response = await userApi.getProfile();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => userApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update profile error:", error);
      const errorMessage =
        error?.message || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordData) => authApi.updatePassword(data),
    onSuccess: () => {
      toast.success("Password updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update password error:", error);
      const errorMessage =
        error?.message || "Failed to update password. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Record<string, any>) =>
      userApi.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      queryClient.invalidateQueries({ queryKey: authKeys.preferences() });
      toast.success("Preferences updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update preferences error:", error);
      const errorMessage =
        error?.message || "Failed to update preferences. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useAddresses = () => {
  return useQuery({
    queryKey: authKeys.addresses(),
    queryFn: async () => {
      const response = await userApi.getAddresses();
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddAddressData) => userApi.addAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
      toast.success("Address added successfully!");
    },
    onError: (error: any) => {
      console.error("Add address error:", error);
      const errorMessage =
        error?.message || "Failed to add address. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: string;
      data: UpdateAddressData;
    }) => userApi.updateAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
      toast.success("Address updated successfully!");
    },
    onError: (error: any) => {
      console.error("Update address error:", error);
      const errorMessage =
        error?.message || "Failed to update address. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => userApi.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
      toast.success("Address deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Delete address error:", error);
      const errorMessage =
        error?.message || "Failed to delete address. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => userApi.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
      toast.success("Default address set successfully!");
    },
    onError: (error: any) => {
      console.error("Set default address error:", error);
      const errorMessage =
        error?.message || "Failed to set default address. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useWishlist = () => {
  return useQuery({
    queryKey: authKeys.wishlist(),
    queryFn: async () => {
      const response = await userApi.getWishlist();
      return response;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => userApi.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.wishlist() });
      toast.success("Added to wishlist!");
    },
    onError: (error: any) => {
      console.error("Add to wishlist error:", error);
      const errorMessage =
        error?.message || "Failed to add to wishlist. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => userApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.wishlist() });
      toast.success("Removed from wishlist!");
    },
    onError: (error: any) => {
      console.error("Remove from wishlist error:", error);
      const errorMessage =
        error?.message || "Failed to remove from wishlist. Please try again.";
      toast.error(errorMessage);
    },
  });
};
