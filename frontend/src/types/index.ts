export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "seller";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
  thumbnail: string;
  alt?: string;
}

export interface CategoryImage {
  url: string;
  altText: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: CategoryImage;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FrontendProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew: boolean;
  features: string[];
  specifications?: Record<string, any>;
}

export interface Product {
  id: string;
  _id?: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew: boolean;
  features: string[];
  specifications: Record<string, any>;
  sku?: string;
  averageRating?: number;
  isFeatured?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?:
    | {
        url: string;
        altText: string;
      }
    | string;
  parent?: string;
  productCount?: number;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  items: Array<{
    product: Product;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }>;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  totalPrice: number;
  shippingPrice: number;
  taxPrice: number;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  addressType?: "home" | "work" | "other";
  isDefault?: boolean;
}

export interface Review {
  _id: string;
  user: User;
  product: Product;
  rating: number;
  title?: string;
  comment: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive: boolean;
  description?: string;
}
