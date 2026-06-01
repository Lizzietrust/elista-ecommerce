"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Shield,
  Truck,
  RefreshCw,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/providers/cart-provider";
import { toast } from "react-hot-toast";

const promoCodes = [
  { code: "WELCOME10", discount: 10, description: "10% off first order" },
  { code: "SAVE20", discount: 20, description: "20% off orders over $100" },
  { code: "FREESHIP", discount: 0, description: "Free shipping on all orders" },
];

export default function CartPage() {
  const cart = useCartContext();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<
    (typeof promoCodes)[0] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const cartItems = cart.items;
  const itemCount = cart.itemCount;
  const subtotal = cart.totalPrice;

  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discount = appliedPromo
    ? appliedPromo.discount === 0
      ? 0
      : subtotal * (appliedPromo.discount / 100)
    : 0;
  const total = subtotal + shipping + tax - discount;

  const handleQuantityChange = (
    itemId: string,
    productId: string,
    color: string | undefined,
    size: string | undefined,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;

    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    if (newQuantity > item.product.stock) {
      toast.error(`Only ${item.product.stock} items available in stock`);
      return;
    }

    cart.updateQuantity(productId, newQuantity, color, size);
    toast.success("Quantity updated");
  };

  const handleRemoveItem = (
    productId: string,
    color?: string,
    size?: string,
  ) => {
    cart.removeItem(productId, color, size);
    toast.success("Item removed from cart");
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    const promo = promoCodes.find(
      (p) => p.code.toLowerCase() === promoCode.toLowerCase().trim(),
    );

    if (promo) {
      setAppliedPromo(promo);
      toast.success(`Promo code "${promo.code}" applied!`);
    } else {
      toast.error("Invalid promo code");
    }

    setPromoCode("");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success("Promo code removed");
  };

  const handleClearCart = () => {
    cart.clearCart();
    toast.success("Cart cleared");
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Proceeding to checkout...");
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-24 w-24 bg-[#F4EFEA] dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-[#6B6B6B]" size={48} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] dark:text-white mb-3">
            Your cart is empty
          </h1>
          <p className="text-[#6B6B6B] dark:text-gray-400 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="gap-2 bg-[#2C3E3E] hover:bg-[#4A6B6B]">
                <ArrowLeft size={16} />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/categories">
              <Button
                variant="outline"
                className="border-[#E8E0D8] hover:bg-[#F4EFEA]"
              >
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#6B6B6B] dark:text-gray-400 mb-2">
            <Link
              href="/"
              className="hover:text-[#C17B4D] dark:hover:text-[#D49A6A] transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#2C2C2C] dark:text-white">
              Shopping Cart
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-[#6B6B6B] dark:text-gray-400 mt-2">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-[#E8E0D8] dark:border-gray-800">
              {/* Table Header (Desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-[#E8E0D8] dark:border-gray-800 bg-[#FDF8F5] dark:bg-gray-800/50">
                <div className="col-span-5 font-medium text-[#2C2C2C] dark:text-gray-300">
                  Product
                </div>
                <div className="col-span-2 font-medium text-[#2C2C2C] dark:text-gray-300">
                  Price
                </div>
                <div className="col-span-3 font-medium text-[#2C2C2C] dark:text-gray-300">
                  Quantity
                </div>
                <div className="col-span-2 font-medium text-[#2C2C2C] dark:text-gray-300 text-right">
                  Total
                </div>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-[#E8E0D8] dark:divide-gray-800">
                {cartItems.map((item) => (
                  <div
                    key={
                      item.id ||
                      `${item.product._id}-${item.color}-${item.size}`
                    }
                    className="p-4 md:p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Product Image & Info */}
                      <div className="flex-1 flex gap-4">
                        <div className="h-24 w-24 shrink-0 bg-[#F4EFEA] dark:bg-gray-800 rounded-xl overflow-hidden">
                          <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-[#D4C4B7]/20 to-[#C17B4D]/20 dark:from-gray-800 dark:to-gray-900">
                            <span className="text-3xl">🛒</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-bold text-[#2C2C2C] dark:text-white">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mt-1 line-clamp-2">
                                {item.product.description}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveItem(
                                  item.product._id,
                                  item.color,
                                  item.size,
                                )
                              }
                              className="md:hidden text-gray-400 hover:text-[#C17B7B] dark:hover:text-[#C17B7B] transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>

                          {/* Variants */}
                          <div className="flex flex-wrap gap-3 mt-3">
                            {item.color && (
                              <div className="text-sm">
                                <span className="text-[#6B6B6B] dark:text-gray-400">
                                  Color:{" "}
                                </span>
                                <span className="font-medium text-[#2C2C2C] dark:text-white">
                                  {item.color}
                                </span>
                              </div>
                            )}
                            {item.size && (
                              <div className="text-sm">
                                <span className="text-[#6B6B6B] dark:text-gray-400">
                                  Size:{" "}
                                </span>
                                <span className="font-medium text-[#2C2C2C] dark:text-white">
                                  {item.size}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price (Mobile) */}
                      <div className="md:hidden flex items-center justify-between mt-4">
                        <div className="text-lg font-bold text-[#2C2C2C] dark:text-white">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className="text-lg font-bold text-[#2C2C2C] dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {/* Price (Desktop) */}
                      <div className="hidden md:block md:w-32 text-center">
                        <div className="text-lg font-bold text-[#2C2C2C] dark:text-white">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="md:w-40">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.id || "",
                                item.product._id,
                                item.color,
                                item.size,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="h-10 w-10 rounded-lg border border-[#E8E0D8] dark:border-gray-700 flex items-center justify-center text-[#2C2C2C] dark:text-gray-300 hover:bg-[#F4EFEA] dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={16} />
                          </button>

                          <div className="flex-1 text-center">
                            <span className="text-lg font-bold text-[#2C2C2C] dark:text-white">
                              {item.quantity}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.id || "",
                                item.product._id,
                                item.color,
                                item.size,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="h-10 w-10 rounded-lg border border-[#E8E0D8] dark:border-gray-700 flex items-center justify-center text-[#2C2C2C] dark:text-gray-300 hover:bg-[#F4EFEA] dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {item.quantity >= item.product.stock && (
                          <p className="text-sm text-[#C17B7B] mt-2 text-center">
                            Max stock reached
                          </p>
                        )}
                      </div>

                      {/* Total & Remove (Desktop) */}
                      <div className="hidden md:flex md:w-32 items-center justify-between">
                        <div className="text-lg font-bold text-[#2C2C2C] dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveItem(
                              item.product._id,
                              item.color,
                              item.size,
                            )
                          }
                          className="text-gray-400 hover:text-[#C17B7B] dark:hover:text-[#C17B7B] transition-colors ml-4"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="p-6 border-t border-[#E8E0D8] dark:border-gray-800 bg-[#FDF8F5] dark:bg-gray-800/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="gap-2 border-[#E8E0D8] hover:bg-[#F4EFEA]"
                    >
                      <ArrowLeft size={16} />
                      Continue Shopping
                    </Button>
                  </Link>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="gap-2 border-[#E8E0D8] hover:bg-[#F4EFEA]"
                      onClick={() => {
                        toast.success("Cart updated");
                      }}
                    >
                      <RefreshCw size={16} />
                      Update Cart
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 text-[#C17B7B] hover:text-[#C17B7B] border-[#C17B7B]/30 hover:bg-[#C17B7B]/10"
                      onClick={handleClearCart}
                    >
                      <Trash2 size={16} />
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex items-center gap-4 border border-[#E8E0D8]">
                <div className="h-12 w-12 rounded-lg bg-[#2C3E3E]/10 flex items-center justify-center">
                  <Shield className="text-[#2C3E3E]" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#2C2C2C] dark:text-white">
                    Secure Payment
                  </h4>
                  <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    Your data is protected
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex items-center gap-4 border border-[#E8E0D8]">
                <div className="h-12 w-12 rounded-lg bg-[#6B8E6B]/10 flex items-center justify-center">
                  <Truck className="text-[#6B8E6B]" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#2C2C2C] dark:text-white">
                    Free Shipping
                  </h4>
                  <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    On orders over $50
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex items-center gap-4 border border-[#E8E0D8]">
                <div className="h-12 w-12 rounded-lg bg-[#C17B4D]/10 flex items-center justify-center">
                  <span className="text-[#C17B4D] text-2xl">↩️</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#2C2C2C] dark:text-white">
                    Easy Returns
                  </h4>
                  <p className="text-sm text-[#6B6B6B] dark:text-gray-400">
                    30-day return policy
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-[#E8E0D8]">
                <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-6">
                  Order Summary
                </h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 px-4 py-3 rounded-xl border border-[#E8E0D8] bg-white dark:bg-gray-800 text-[#2C2C2C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C17B4D]"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      variant="outline"
                      className="whitespace-nowrap border-[#E8E0D8] hover:bg-[#F4EFEA]"
                    >
                      Apply
                    </Button>
                  </div>

                  {appliedPromo && (
                    <div className="flex items-center justify-between p-3 bg-[#6B8E6B]/10 rounded-xl">
                      <div>
                        <div className="font-medium text-[#6B8E6B]">
                          {appliedPromo.code} applied
                        </div>
                        <div className="text-sm text-[#6B8E6B]">
                          {appliedPromo.description}
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-[#6B8E6B] hover:text-[#6B8E6B]/80 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}

                  {/* Available Promo Codes */}
                  <div className="mt-4">
                    <p className="text-sm font-medium text-[#2C2C2C] dark:text-gray-300 mb-2">
                      Available promo codes:
                    </p>
                    <div className="space-y-2">
                      {promoCodes.map((promo) => (
                        <div
                          key={promo.code}
                          className="flex items-center justify-between text-sm"
                        >
                          <code className="bg-[#F4EFEA] dark:bg-gray-800 px-2 py-1 rounded text-[#2C2C2C] dark:text-gray-300">
                            {promo.code}
                          </code>
                          <span className="text-[#6B6B6B] dark:text-gray-400">
                            {promo.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium text-[#2C2C2C] dark:text-white">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Shipping
                    </span>
                    <span
                      className={`font-medium ${shipping === 0 ? "text-[#6B8E6B]" : "text-[#2C2C2C] dark:text-white"}`}
                    >
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#6B6B6B] dark:text-gray-400">
                        Discount
                      </span>
                      <span className="font-medium text-[#6B8E6B]">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] dark:text-gray-400">
                      Tax
                    </span>
                    <span className="font-medium text-[#2C2C2C] dark:text-white">
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-[#E8E0D8] dark:border-gray-800">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-[#2C2C2C] dark:text-white">
                        Total
                      </span>
                      <span className="text-[#2C2C2C] dark:text-white">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mt-1">
                      Including ${tax.toFixed(2)} in taxes
                    </p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading || cartItems.length === 0}
                  className="w-full py-4 text-lg mb-4 bg-[#2C3E3E] hover:bg-[#4A6B6B] transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>

                {/* Payment Methods */}
                <div className="text-center">
                  <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mb-3">
                    We accept:
                  </p>
                  <div className="flex justify-center gap-4">
                    <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
                      <span className="font-bold text-[#2C2C2C] dark:text-gray-300">
                        VISA
                      </span>
                    </div>
                    <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
                      <span className="font-bold text-[#2C2C2C] dark:text-gray-300">
                        MC
                      </span>
                    </div>
                    <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
                      <span className="font-bold text-[#2C2C2C] dark:text-gray-300">
                        PP
                      </span>
                    </div>
                    <div className="h-8 w-12 bg-[#F4EFEA] dark:bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-2xl">🍎</span>
                    </div>
                  </div>
                </div>

                {/* Cart Summary */}
                <div className="mt-8 pt-6 border-t border-[#E8E0D8] dark:border-gray-800">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B6B6B] dark:text-gray-400">
                        Items in cart
                      </span>
                      <span className="font-medium text-[#2C2C2C] dark:text-white">
                        {itemCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B6B6B] dark:text-gray-400">
                        Estimated delivery
                      </span>
                      <span className="font-medium text-[#2C2C2C] dark:text-white">
                        3-5 business days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B6B6B] dark:text-gray-400">
                        Return policy
                      </span>
                      <span className="font-medium text-[#2C2C2C] dark:text-white">
                        30 days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-[#2C3E3E]/10 rounded-xl border border-[#2C3E3E]/20">
                <div className="flex items-start gap-3">
                  <Shield className="text-[#2C3E3E] mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-[#2C3E3E] font-medium">
                      Secure checkout
                    </p>
                    <p className="text-xs text-[#2C3E3E]/80 mt-1">
                      Your payment information is encrypted and secure. We never
                      store your credit card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-[#2C2C2C] dark:text-white mb-6">
            Frequently Bought Together
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Phone Stand", price: 24.99, image: "📱" },
              { name: "Screen Protector", price: 12.99, image: "🛡️" },
              { name: "USB-C Cable", price: 15.99, image: "🔌" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-4 border border-[#E8E0D8] hover:shadow-md transition-shadow"
              >
                <div className="h-16 w-16 bg-[#F4EFEA] dark:bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                  {item.image}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[#2C2C2C] dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-lg font-bold text-[#C17B4D]">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <Button size="sm" className="bg-[#2C3E3E] hover:bg-[#4A6B6B]">
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
