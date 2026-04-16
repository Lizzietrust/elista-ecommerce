"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  Lock,
  Tag,
  CreditCard,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  onCheckout?: () => void;
  isLoading?: boolean;
  showPromoCode?: boolean;
}

const promoCodes = [
  {
    code: "WELCOME10",
    discount: 10,
    description: "10% off first order",
    minOrder: 0,
  },
  {
    code: "SAVE20",
    discount: 20,
    description: "20% off orders over $100",
    minOrder: 100,
  },
  {
    code: "FREESHIP",
    discount: 0,
    description: "Free shipping on all orders",
    minOrder: 0,
  },
  {
    code: "HOLIDAY25",
    discount: 25,
    description: "25% off holiday special",
    minOrder: 150,
  },
];

export default function CartSummary({
  subtotal,
  itemCount,
  shipping = 9.99,
  tax = 0.08,
  discount = 0,
  onCheckout,
  isLoading = false,
  showPromoCode = true,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<
    (typeof promoCodes)[0] | null
  >(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Calculate totals
  const shippingCost = subtotal > 50 ? 0 : shipping;
  const taxAmount = subtotal * tax;
  const discountAmount = appliedPromo
    ? appliedPromo.discount === 0
      ? 0
      : subtotal * (appliedPromo.discount / 100)
    : discount;
  const total = subtotal + shippingCost + taxAmount - discountAmount;
  const savings = subtotal + shippingCost + taxAmount - total;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const promo = promoCodes.find(
        (p) => p.code.toLowerCase() === promoCode.toLowerCase().trim(),
      );

      if (promo) {
        if (subtotal >= promo.minOrder) {
          setAppliedPromo(promo);
          toast.success(`Promo code "${promo.code}" applied!`);
          setPromoCode("");
        } else {
          toast.error(
            `Minimum order of $${promo.minOrder} required for this promo`,
          );
        }
      } else {
        toast.error("Invalid promo code");
      }
    } catch (error) {
      toast.error("Failed to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success("Promo code removed");
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      toast.success("Proceeding to checkout...");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 border border-[#E8E0D8] dark:border-gray-800 sticky top-24">
      <h2 className="text-xl md:text-2xl font-bold text-[#2C2C2C] dark:text-white mb-6 flex items-center gap-2">
        <ShoppingBag size={24} className="text-[#C17B4D]" />
        Order Summary
      </h2>

      {/* Order Items Count */}
      <div className="mb-6 pb-6 border-b border-[#E8E0D8] dark:border-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-[#6B6B6B] dark:text-gray-400">
            Items ({itemCount})
          </span>
          <span className="font-medium text-[#2C2C2C] dark:text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[#6B6B6B] dark:text-gray-400">Subtotal</span>
          <span className="font-medium text-[#2C2C2C] dark:text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-[#6B6B6B]" />
            <span className="text-[#6B6B6B] dark:text-gray-400">Shipping</span>
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
              <Tag size={16} className="text-[#6B8E6B]" />
              <span className="text-[#6B6B6B] dark:text-gray-400">
                Discount
              </span>
            </div>
            <span className="font-medium text-[#6B8E6B]">
              -${discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-[#E8E0D8] dark:border-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-[#2C2C2C] dark:text-white">
              Total
            </span>
            <div className="text-right">
              <span className="text-2xl md:text-3xl font-bold text-[#C17B4D]">
                ${total.toFixed(2)}
              </span>
              {savings > 0 && (
                <div className="text-sm text-[#6B8E6B] mt-1">
                  You saved ${savings.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          {shippingCost === 0 && subtotal < 50 && (
            <p className="text-xs text-[#6B8E6B] mt-2">
              ✨ Free shipping applied
            </p>
          )}
        </div>
      </div>

      {/* Promo Code Section */}
      {showPromoCode && (
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Tag
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B6B6B]"
                size={16}
              />
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                disabled={!!appliedPromo || isApplyingPromo}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8E0D8] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D] disabled:opacity-50"
              />
            </div>
            <Button
              onClick={handleApplyPromo}
              disabled={!!appliedPromo || isApplyingPromo || !promoCode.trim()}
              variant="outline"
              className="border-[#E8E0D8] hover:bg-[#F4EFEA] hover:border-[#C17B4D] disabled:opacity-50"
            >
              {isApplyingPromo ? (
                <div className="h-4 w-4 border-2 border-[#C17B4D] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {appliedPromo && (
            <div className="flex items-center justify-between p-3 bg-[#6B8E6B]/10 rounded-xl border border-[#6B8E6B]/20">
              <div>
                <div className="font-medium text-[#6B8E6B] flex items-center gap-2">
                  <CheckCircle size={16} />
                  {appliedPromo.code} applied
                </div>
                <div className="text-sm text-[#6B6B6B] dark:text-gray-400">
                  {appliedPromo.description}
                </div>
              </div>
              <button
                onClick={handleRemovePromo}
                className="text-[#6B8E6B] hover:text-[#6B8E6B]/80 transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* Available Promos */}
          <div className="mt-4">
            <p className="text-xs font-medium text-[#6B6B6B] dark:text-gray-400 mb-2">
              Available offers:
            </p>
            <div className="space-y-1">
              {promoCodes.slice(0, 2).map((promo) => (
                <div
                  key={promo.code}
                  className="text-xs text-[#6B6B6B] dark:text-gray-400"
                >
                  <span className="font-mono bg-[#F4EFEA] dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {promo.code}
                  </span>
                  <span className="ml-2">- {promo.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={isLoading || itemCount === 0}
        className="w-full py-4 text-lg mb-4 bg-[#2C3E3E] hover:bg-[#4A6B6B] transition-all group"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            Proceed to Checkout
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        )}
      </Button>

      {/* Payment Methods */}
      <div className="text-center mb-6">
        <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mb-3">
          We accept:
        </p>
        <div className="flex justify-center gap-3">
          <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
            <span className="font-bold text-xs text-[#2C2C2C] dark:text-gray-300">
              VISA
            </span>
          </div>
          <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
            <span className="font-bold text-xs text-[#2C2C2C] dark:text-gray-300">
              MC
            </span>
          </div>
          <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
            <span className="font-bold text-xs text-[#2C2C2C] dark:text-gray-300">
              AMEX
            </span>
          </div>
          <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
            <span className="font-bold text-xs text-[#2C2C2C] dark:text-gray-300">
              PP
            </span>
          </div>
          <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
            <span className="text-lg">🍎</span>
          </div>
        </div>
      </div>

      {/* Security Badges */}
      <div className="space-y-3 pt-4 border-t border-[#E8E0D8] dark:border-gray-800">
        <div className="flex items-center gap-3 text-sm text-[#6B6B6B] dark:text-gray-400">
          <Lock size={16} className="text-[#6B8E6B]" />
          <span>Secure Checkout</span>
          <div className="h-4 w-px bg-[#E8E0D8] dark:border-gray-700"></div>
          <Shield size={16} className="text-[#6B8E6B]" />
          <span>SSL Encrypted</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-[#6B6B6B] dark:text-gray-400">
          <RefreshCw size={16} className="text-[#C17B4D]" />
          <span>30-Day Returns</span>
          <div className="h-4 w-px bg-[#E8E0D8] dark:border-gray-700"></div>
          <CreditCard size={16} className="text-[#C17B4D]" />
          <span>Secure Payments</span>
        </div>
      </div>

      {/* Free Shipping Threshold */}
      {subtotal < 50 && (
        <div className="mt-6 p-4 bg-[#C17B4D]/10 rounded-xl border border-[#C17B4D]/20">
          <div className="flex items-start gap-3">
            <Truck className="text-[#C17B4D] mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-sm font-medium text-[#2C2C2C] dark:text-white">
                Add ${(50 - subtotal).toFixed(2)} more to get free shipping
              </p>
              <div className="mt-2 h-2 bg-[#F4EFEA] dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C17B4D] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Savings Notice */}
      {savings > 0 && (
        <div className="mt-4 p-3 bg-[#6B8E6B]/10 rounded-xl border border-[#6B8E6B]/20">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-[#6B8E6B]" />
            <p className="text-sm text-[#6B8E6B]">
              You're saving ${savings.toFixed(2)} on this order!
            </p>
          </div>
        </div>
      )}

      {/* Low Stock Warning (Optional - would need cart items prop) */}
      {/* {hasLowStock && (
        <div className="mt-4 p-3 bg-[#C17B7B]/10 rounded-xl border border-[#C17B7B]/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-[#C17B7B] mt-0.5" />
            <p className="text-xs text-[#C17B7B]">
              Some items in your cart are running low on stock. Complete your purchase soon!
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
}
