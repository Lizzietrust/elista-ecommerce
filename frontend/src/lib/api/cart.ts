import { typedApiClient, BaseApiResponse } from "./client";
import { Product } from "./products";

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  addedAt: string;
  color?: string;
  size?: string;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  productCount: number;
  coupon: string | null;
}

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
}

export interface AddToCartResponse {
  items: CartItem[];
  itemCount: number;
}

export interface CartCountResponse {
  itemCount: number;
  productCount: number;
}

export interface CouponResponse {
  coupon: {
    code: string;
    discountType: string;
    discountValue: number;
    discount: number;
  };
}

export interface AvailableCoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  isActive: boolean;
  isAvailable: boolean;
  comingSoon?: boolean;
  brands?: string[];
}

export interface CheckoutRequest {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    fullName: string;
  };
  paymentMethod: PaymentMethod | string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      images?: string[];
    };
    name: string;
    quantity: number;
    price: number;
    image?: string;
    color?: string;
    size?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    fullName: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discountAmount: number;
  totalPrice: number;
  coupon?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
export interface CheckoutResponse {
  order: Order;
  paymentIntent?: {
    clientSecret: string;
    paymentIntentId: string;
  };
}

export const cartApi = {
  getCart: async (): Promise<BaseApiResponse<CartResponse>> => {
    const response =
      await typedApiClient.get<BaseApiResponse<CartResponse>>("/cart");
    return response;
  },

  addToCart: async (
    productId: string,
    quantity: number = 1,
  ): Promise<BaseApiResponse<AddToCartResponse>> => {
    const response = await typedApiClient.post<
      BaseApiResponse<AddToCartResponse>
    >("/cart/add", { productId, quantity });
    return response;
  },

  updateCartItemQuantity: async (
    itemId: string,
    quantity: number,
  ): Promise<
    BaseApiResponse<{ itemId: string; quantity: number; removed: boolean }>
  > => {
    const response = await typedApiClient.patch<
      BaseApiResponse<{ itemId: string; quantity: number; removed: boolean }>
    >(`/cart/${itemId}/quantity`, { quantity });
    return response;
  },

  incrementCartItem: async (
    itemId: string,
  ): Promise<
    BaseApiResponse<{ itemId: string; quantity: number; removed: boolean }>
  > => {
    const response = await typedApiClient.patch<
      BaseApiResponse<{ itemId: string; quantity: number; removed: boolean }>
    >(`/cart/${itemId}/quantity`, { operation: "increment" });
    return response;
  },

  decrementCartItem: async (
    itemId: string,
  ): Promise<
    BaseApiResponse<{ itemId: string; quantity: number; removed: boolean }>
  > => {
    const response = await typedApiClient.patch<
      BaseApiResponse<{ itemId: string; quantity: number; removed: boolean }>
    >(`/cart/${itemId}/quantity`, { operation: "decrement" });
    return response;
  },

  removeFromCart: async (
    itemId: string,
  ): Promise<BaseApiResponse<{ itemId: string; itemCount: number }>> => {
    const response = await typedApiClient.delete<
      BaseApiResponse<{ itemId: string; itemCount: number }>
    >(`/cart/${itemId}`);
    return response;
  },

  clearCart: async (): Promise<
    BaseApiResponse<{ items: []; itemCount: 0 }>
  > => {
    const response =
      await typedApiClient.delete<BaseApiResponse<{ items: []; itemCount: 0 }>>(
        "/cart",
      );
    return response;
  },

  getCartSummary: async (): Promise<BaseApiResponse<CartResponse>> => {
    const response =
      await typedApiClient.get<BaseApiResponse<CartResponse>>("/cart/summary");
    return response;
  },

  getCartCount: async (): Promise<BaseApiResponse<CartCountResponse>> => {
    const response =
      await typedApiClient.get<BaseApiResponse<CartCountResponse>>(
        "/cart/count",
      );
    return response;
  },

  applyCoupon: async (
    couponCode: string,
  ): Promise<BaseApiResponse<CouponResponse>> => {
    const response = await typedApiClient.post<BaseApiResponse<CouponResponse>>(
      "/cart/coupon/apply",
      { couponCode },
    );
    return response;
  },

  removeCoupon: async (): Promise<BaseApiResponse<{}>> => {
    const response = await typedApiClient.delete<BaseApiResponse<{}>>(
      "/cart/coupon/remove",
    );
    return response;
  },

  moveToWishlist: async (
    itemId: string,
  ): Promise<
    BaseApiResponse<{
      movedToWishlist: boolean;
      removedFromCart: boolean;
      productId: string;
    }>
  > => {
    const response = await typedApiClient.post<
      BaseApiResponse<{
        movedToWishlist: boolean;
        removedFromCart: boolean;
        productId: string;
      }>
    >(`/cart/${itemId}/move-to-wishlist`);
    return response;
  },

  mergeCart: async (
    guestCart: Array<{ productId: string; quantity: number }>,
  ): Promise<
    BaseApiResponse<{ itemsMerged: number; newItemCount: number }>
  > => {
    const response = await typedApiClient.post<
      BaseApiResponse<{ itemsMerged: number; newItemCount: number }>
    >("/cart/merge", { guestCart });
    return response;
  },

  getAvailableCoupons: async (): Promise<
    BaseApiResponse<AvailableCoupon[]>
  > => {
    const response = await typedApiClient.get<
      BaseApiResponse<AvailableCoupon[]>
    >("/cart/coupons/available");
    return response;
  },

  getAvailablePaymentMethods: async (): Promise<
    BaseApiResponse<PaymentMethod[]>
  > => {
    const response = await typedApiClient.get<BaseApiResponse<PaymentMethod[]>>(
      "/payments/methods/available",
    );
    return response;
  },

  checkout: async (
    data: CheckoutRequest,
  ): Promise<BaseApiResponse<CheckoutResponse>> => {
    const response = await typedApiClient.post<
      BaseApiResponse<CheckoutResponse>
    >("/cart/checkout", data);
    return response;
  },
};
