"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  Clock,
  MapPin,
  CreditCard,
  Package,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OrderSummaryItem {
  id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: Array<{
      url: string;
      alt: string;
    }>;
    category: string;
  };
  quantity: number;
  color?: string;
  size?: string;
  price: number;
}

export interface OrderSummaryProps {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  savings?: number;
  onContinueShopping?: () => void;
  onCheckout?: () => void;
  showActions?: boolean;
  isCheckoutPage?: boolean;
  compact?: boolean;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: {
    type: string;
    last4?: string;
  };
  estimatedDelivery?: string;
}

export default function OrderSummary({
  items,
  subtotal,
  shipping = 9.99,
  tax = 0.08,
  discount = 0,
  total,
  savings = 0,
  onContinueShopping,
  onCheckout,
  showActions = true,
  isCheckoutPage = false,
  compact = false,
  shippingAddress,
  paymentMethod,
  estimatedDelivery,
}: OrderSummaryProps) {
  const shippingCost = subtotal > 50 ? 0 : shipping;
  const taxAmount = subtotal * tax;
  const discountAmount = discount;
  const finalTotal =
    total || subtotal + shippingCost + taxAmount - discountAmount;
  const totalSavings =
    savings || subtotal + shippingCost + taxAmount - finalTotal;

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-[#E8E0D8] dark:border-gray-800">
        <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6 flex items-center gap-2">
          <ShoppingBag size={20} className="text-[#C17B4D]" />
          Order Summary
        </h2>

        {/* Items Preview */}
        <div className="space-y-3 mb-6">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="h-12 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                {item.product.images && item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-xl">🛒</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2C2C2C] dark:text-white truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-[#6B6B6B] dark:text-gray-400">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="text-sm font-medium text-[#C17B4D]">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-sm text-[#6B6B6B] dark:text-gray-400 text-center pt-2">
              +{items.length - 3} more items
            </p>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 pt-4 border-t border-[#E8E0D8] dark:border-gray-800">
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B] dark:text-gray-400">Subtotal</span>
            <span className="font-medium text-[#2C2C2C] dark:text-white">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B] dark:text-gray-400">Shipping</span>
            <span
              className={
                shippingCost === 0
                  ? "text-[#6B8E6B]"
                  : "text-[#2C2C2C] dark:text-white"
              }
            >
              {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B] dark:text-gray-400">
                Discount
              </span>
              <span className="text-[#6B8E6B]">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-[#E8E0D8] dark:border-gray-800">
            <div className="flex justify-between font-bold">
              <span className="text-[#2C2C2C] dark:text-white">Total</span>
              <span className="text-xl font-bold text-[#C17B4D]">
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <Button
            onClick={onCheckout}
            className="w-full mt-6 bg-[#2C3E3E] hover:bg-[#4A6B6B]"
          >
            Proceed to Checkout
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
        <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-white mb-6 flex items-center gap-2">
          <ShoppingBag size={24} className="text-[#C17B4D]" />
          Order Summary
        </h2>

        {/* Order Items */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 py-4 border-b border-[#E8E0D8] dark:border-gray-800 last:border-0"
            >
              {/* Product Image */}
              <Link
                href={`/products/${item.product.slug}`}
                className="shrink-0"
              >
                <div className="h-20 w-20 bg-[#F4EFEA] dark:bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
                  {item.product.images && item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl">🛒</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="font-semibold text-[#2C2C2C] dark:text-white hover:text-[#C17B4D] transition-colors line-clamp-1">
                    {item.product.name}
                  </h3>
                </Link>

                <p className="text-xs text-[#6B6B6B] dark:text-gray-400 mt-1">
                  Category: {item.product.category}
                </p>

                {(item.color || item.size) && (
                  <p className="text-xs text-[#6B6B6B] dark:text-gray-400 mt-1">
                    {item.color && <span>Color: {item.color}</span>}
                    {item.color && item.size && <span> • </span>}
                    {item.size && <span>Size: {item.size}</span>}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    Qty: {item.quantity}
                  </span>
                  <span className="font-semibold text-[#C17B4D]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 pt-4 border-t border-[#E8E0D8] dark:border-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-[#6B6B6B] dark:text-gray-400">Subtotal</span>
            <span className="font-medium text-[#2C2C2C] dark:text-white">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-[#6B6B6B]" />
              <span className="text-[#6B6B6B] dark:text-gray-400">
                Shipping
              </span>
            </div>
            <span
              className={`font-medium ${shippingCost === 0 ? "text-[#6B8E6B]" : "text-[#2C2C2C] dark:text-white"}`}
            >
              {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#6B6B6B] dark:text-gray-400">
              Tax ({(tax * 100).toFixed(0)}%)
            </span>
            <span className="font-medium text-[#2C2C2C] dark:text-white">
              ${taxAmount.toFixed(2)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#6B8E6B]"></div>
                <span className="text-[#6B6B6B] dark:text-gray-400">
                  Discount
                </span>
              </div>
              <span className="font-medium text-[#6B8E6B]">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-4 mt-2 border-t border-[#E8E0D8] dark:border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#2C2C2C] dark:text-white">
                Total
              </span>
              <div className="text-right">
                <span className="text-2xl md:text-3xl font-bold text-[#C17B4D]">
                  ${finalTotal.toFixed(2)}
                </span>
                {totalSavings > 0 && (
                  <div className="text-sm text-[#6B8E6B] mt-1">
                    You saved ${totalSavings.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Free Shipping Progress */}
        {subtotal < 50 && !isCheckoutPage && (
          <div className="mt-6 p-4 bg-[#C17B4D]/10 rounded-xl border border-[#C17B4D]/20">
            <div className="flex items-start gap-3">
              <Truck
                className="text-[#C17B4D] mt-0.5 shrink-0"
                size={18}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                  Add ${(50 - subtotal).toFixed(2)} more to get free shipping
                </p>
                <div className="mt-2 h-2 bg-[#F4EFEA] dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C17B4D] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((subtotal / 50) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-6 space-y-3">
            {!isCheckoutPage ? (
              <>
                <Button
                  onClick={onCheckout}
                  className="w-full py-3 bg-[#2C3E3E] hover:bg-[#4A6B6B]"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  onClick={onContinueShopping}
                  variant="outline"
                  className="w-full border-[#E8E0D8] hover:bg-[#F4EFEA]"
                >
                  Continue Shopping
                </Button>
              </>
            ) : (
              <Button
                onClick={onCheckout}
                className="w-full py-3 bg-[#2C3E3E] hover:bg-[#4A6B6B]"
              >
                Place Order
              </Button>
            )}
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-[#E8E0D8] dark:border-gray-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#6B8E6B]" />
              <span className="text-xs text-[#6B6B6B] dark:text-gray-400">
                Secure Checkout
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-[#C17B4D]" />
              <span className="text-xs text-[#6B6B6B] dark:text-gray-400">
                30-Day Returns
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Information (Checkout Page) */}
      {isCheckoutPage && shippingAddress && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
          <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-[#C17B4D]" />
            Shipping Information
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-[#2C2C2C] dark:text-white font-medium">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p className="text-[#6B6B6B] dark:text-gray-400">
              {shippingAddress.address}
              <br />
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
              <br />
              {shippingAddress.country}
            </p>
          </div>
          {estimatedDelivery && (
            <div className="mt-4 p-3 bg-[#2C3E3E]/10 rounded-xl flex items-center gap-2">
              <Clock size={16} className="text-[#2C3E3E]" />
              <span className="text-sm text-[#2C3E3E]">
                Estimated Delivery: {estimatedDelivery}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Payment Information (Checkout Page) */}
      {isCheckoutPage && paymentMethod && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800">
          <h3 className="text-lg font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-[#C17B4D]" />
            Payment Method
          </h3>
          <div className="flex items-center gap-3">
            <div className="h-12 w-16 bg-[#F4EFEA] dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-xl">
                {paymentMethod.type === "card" && "💳"}
                {paymentMethod.type === "paypal" && "🔵"}
                {paymentMethod.type === "applepay" && "🍎"}
                {paymentMethod.type === "googlepay" && "📱"}
              </span>
            </div>
            <div>
              <p className="font-medium text-[#2C2C2C] dark:text-white capitalize">
                {paymentMethod.type}
                {paymentMethod.last4 && ` ending in ${paymentMethod.last4}`}
              </p>
              <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                Secure payment method
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Need Help Section */}
      <div className="bg-linear-to-r from-[#F4EFEA] to-[#E8E0D8] dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-[#E8E0D8] dark:border-gray-800">
        <h3 className="font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
          <Package size={18} className="text-[#C17B4D]" />
          Need Help?
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#C17B4D]/10 flex items-center justify-center">
              <span className="text-[#C17B4D]">📞</span>
            </div>
            <div>
              <div className="font-medium text-[#2C2C2C] dark:text-white">
                Customer Support
              </div>
              <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                1-800-ELISTA (Mon-Fri, 9AM-6PM)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#C17B4D]/10 flex items-center justify-center">
              <span className="text-[#C17B4D]">💬</span>
            </div>
            <div>
              <div className="font-medium text-[#2C2C2C] dark:text-white">
                Live Chat
              </div>
              <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                24/7 customer support
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#C17B4D]/10 flex items-center justify-center">
              <span className="text-[#C17B4D]">📧</span>
            </div>
            <div>
              <div className="font-medium text-[#2C2C2C] dark:text-white">
                Email Us
              </div>
              <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                support@elista.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Satisfaction Guarantee */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#E8E0D8] dark:border-gray-800 text-center">
        <div className="flex justify-center mb-3">
          <CheckCircle className="text-[#6B8E6B]" size={32} />
        </div>
        <h4 className="font-bold text-[#2C2C2C] dark:text-white mb-2">
          Satisfaction Guaranteed
        </h4>
        <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
          Not happy with your purchase? We offer a 30-day money-back guarantee.
        </p>
      </div>
    </div>
  );
}
