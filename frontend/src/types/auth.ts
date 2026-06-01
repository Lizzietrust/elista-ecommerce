export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "seller";
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  addresses?: Address[];
  preferences?: UserPreferences;
  wishlist?: string[];
  recentlyViewed?: string[];
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  addressType: "home" | "work" | "other";
  phone?: string;
  fullName?: string;
  createdAt: string;
}

export interface UserPreferences {
  newsletter: boolean;
  marketingEmails: boolean;
  currency: "USD" | "EUR" | "GBP" | "CAD" | "AUD";
  language: "en" | "es" | "fr" | "de" | "zh";
  shippingPreference: "standard" | "express" | "economy";
  taxExempt: boolean;
  defaultPaymentMethodType: "card" | "bank_transfer";
  savePaymentMethods: boolean;
  autoSavePaymentMethods: boolean;
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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
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
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
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

export interface AddAddressData {
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

export interface UpdateAddressData extends Partial<AddAddressData> {}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  completedOrders?: number;
  pendingOrders?: number;
}

export interface UserProfileResponse {
  success: boolean;
  data: {
    user: User;
    stats: UserStats;
  };
}

export interface AddressResponse {
  success: boolean;
  count: number;
  data: Address[];
  message?: string;
}

export interface WishlistResponse {
  success: boolean;
  count: number;
  data: any[];
  message?: string;
}
