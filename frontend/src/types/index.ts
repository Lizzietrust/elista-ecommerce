export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "seller";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  discountPercentage: number;
  comparePrice?: number;
  images:
    | Array<{
        url: string;
        publicId: string;
        thumbnail: string;
        alt?: string;
      }>
    | string[];
  category: Category | string;
  brand?: string;
  rating: number;
  stock: number;
  sku: string;
  tags: string[];
  colors?: string[];
  sizes?: string[];
  weight?: {
    value: number;
    unit: "g" | "kg" | "lb" | "oz";
  };
  isNew: boolean;
  features?: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  seller?: User;
  createdAt: string;
  updatedAt: string;
  specifications?: Record<string, string>;
  relatedProducts?: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    altText: string;
  } | string;
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
