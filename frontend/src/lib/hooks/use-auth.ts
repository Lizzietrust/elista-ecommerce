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
      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem("token", data.token);
      }

      queryClient.setQueryData(authKeys.me(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterCredentials) => authApi.register(data),
    onSuccess: (data) => {
      if (data && data.token && typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }

      if (data && data.user) {
        queryClient.setQueryData(authKeys.me(), data.user);
      }

      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");

        sessionStorage.clear();
      }

      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();

      router.push("/");
    },
    onError: (error) => {
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
      const response = await authApi.getMe();
      return response.user;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: false,
    ...options,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: ResetPasswordData }) =>
      authApi.resetPassword(token, data),
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
    },
  });
};

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerificationEmail(email),
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
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordData) => authApi.updatePassword(data),
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
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => userApi.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => userApi.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.addresses() });
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
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => userApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.wishlist() });
    },
  });
};
