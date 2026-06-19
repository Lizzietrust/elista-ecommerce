export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "seller";
  isEmailVerified: boolean;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  addresses?: Address[];
  wishlist?: string[];
  recentlyViewed?: string[];
  preferences?: UserPreferences;
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressType?: "home" | "work" | "other";
  isDefault?: boolean;
  phone?: string;
  fullName?: string;
}

export interface UserPreferences {
  newsletter?: boolean;
  marketingEmails?: boolean;
  currency?: string;
  language?: string;
  shippingPreference?: "standard" | "express" | "economy";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address?: Address;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: Address;
  dateOfBirth?: string;
  gender?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface AddAddressData extends Address {}
export interface UpdateAddressData extends Partial<Address> {}

export interface UserProfileResponse {
  success: boolean;
  data: User;
}

export interface AddressResponse {
  success: boolean;
  data: Address[];
}

export interface WishlistResponse {
  success: boolean;
  wishlist: {
    items: any[];
    itemCount: number;
  };
}
