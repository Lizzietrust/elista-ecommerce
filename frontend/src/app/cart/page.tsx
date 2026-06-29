"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Tag,
  Sparkles,
  Gift,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  useCart,
  useRemoveFromCart,
  useClearCart,
  useUpdateCartItemQuantity,
  useIncrementCartItem,
  useDecrementCartItem,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/lib/hooks/use-cart";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

const promoCodes = [
  { code: "WELCOME10", discount: 10, description: "10% off first order" },
  { code: "SAVE20", discount: 20, description: "20% off orders over $100" },
  { code: "FREESHIP", discount: 0, description: "Free shipping on all orders" },
];

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to view your cart", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login?redirect=/cart");
    }
  }, [isAuthenticated, authLoading, router]);

  const {
    data: cartData,
    isLoading: isCartLoading,
    refetch,
  } = useCart({
    enabled: isAuthenticated,
  });

  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();
  const { mutate: incrementItem, isPending: isIncrementing } =
    useIncrementCartItem();
  const { mutate: decrementItem, isPending: isDecrementing } =
    useDecrementCartItem();
  const { mutate: applyCoupon, isPending: isApplyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: isRemovingCoupon } =
    useRemoveCoupon();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cartItems = cartData?.items || [];
  const summary = cartData?.summary;

  const itemCount = summary?.itemCount || 0;
  const subtotal = summary?.subtotal || 0;
  const shipping = summary?.shipping || 0;
  const tax = summary?.tax || 0;
  const discount = summary?.discount || 0;
  const total = summary?.total || 0;

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId, {
      onSuccess: () => {
        toast.success("Item removed from cart");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to remove item");
      },
    });
  };

  const handleIncrement = (
    itemId: string,
    currentQuantity: number,
    stock: number,
  ) => {
    if (currentQuantity >= stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }

    incrementItem(itemId, {
      onSuccess: () => {
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update quantity");
      },
    });
  };

  const handleDecrement = (itemId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) return;

    decrementItem(itemId, {
      onSuccess: () => {
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to update quantity");
      },
    });
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    applyCoupon(promoCode.trim(), {
      onSuccess: (response) => {
        const couponData = response.data?.coupon;
        if (couponData) {
          setAppliedPromo({
            code: couponData.code,
            discount: couponData.discountValue,
            description: `${couponData.discountValue}% off`,
          });
        }
        setPromoCode("");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Invalid promo code");
      },
    });
  };

  const handleRemovePromo = () => {
    removeCoupon(undefined, {
      onSuccess: () => {
        setAppliedPromo(null);
        toast.success("Promo code removed");
        refetch();
      },
      onError: () => {
        toast.error("Failed to remove promo code");
      },
    });
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is already empty");
      return;
    }

    if (confirm("Are you sure you want to clear your entire cart?")) {
      clearCart(undefined, {
        onSuccess: () => {
          toast.success("Cart cleared");
          refetch();
        },
        onError: () => {
          toast.error("Failed to clear cart");
        },
      });
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Proceeding to checkout...");
      router.push("/checkout");
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isCartLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-linear-to-b from-background to-background-secondary">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-accent/5 blur-2xl animate-pulse"></div>
            </div>
            <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4 relative z-10" />
          </div>
          <p className="text-foreground-muted animate-pulse">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-linear-to-b from-background to-background-secondary">
        <div className="text-center max-w-md animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-accent/5 blur-2xl"></div>
            </div>
            <div className="h-28 w-28 bg-linear-to-br from-background-secondary to-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
              <ShoppingBag className="text-accent" size={52} />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-serif bg-linear-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
            Your cart is empty
          </h1>
          <p className="text-foreground-muted mb-8 text-lg">
            Looks like you haven't added any items to your cart yet.
            <br />
            <span className="text-sm text-accent/70">
              Start exploring our collection!
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="gap-2 bg-linear-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-primary-foreground px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                <ArrowLeft size={18} />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/categories">
              <Button
                variant="outline"
                className="border-2 border-border hover:border-accent/50 hover:bg-background-secondary text-foreground px-8 py-6 text-base rounded-xl transition-all duration-300"
              >
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isMutating =
    isRemoving || isClearing || isIncrementing || isDecrementing;

  return (
    <div className="py-8 md:py-12 bg-linear-to-b from-background to-background-secondary/50 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Link
              href="/"
              className="hover:text-accent transition-colors duration-200"
            >
              Home
            </Link>
            <ChevronRight size={14} className="text-foreground-muted/50" />
            <span className="text-foreground font-medium">Shopping Cart</span>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                Shopping Cart
              </h1>
              <p className="text-foreground-muted mt-2 text-lg flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            {itemCount > 0 && (
              <div className="mt-4 sm:mt-0 flex items-center gap-2 text-sm bg-accent/5 px-4 py-2 rounded-full border border-accent/10">
                <Sparkles size={16} className="text-accent" />
                <span className="text-foreground-muted">Ready to checkout</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
              {/* Table Header (Desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-linear-to-r from-background-secondary/80 to-background-secondary/30 border-b border-border/50">
                <div className="col-span-5 font-medium text-foreground-muted text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="text-accent">✦</span> Product
                </div>
                <div className="col-span-2 font-medium text-foreground-muted text-sm uppercase tracking-wider">
                  Price
                </div>
                <div className="col-span-3 font-medium text-foreground-muted text-sm uppercase tracking-wider">
                  Quantity
                </div>
                <div className="col-span-2 font-medium text-foreground-muted text-sm uppercase tracking-wider text-right">
                  Total
                </div>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-border/50">
                {cartItems.map((item, index) => {
                  const itemId = item._id;

                  if (!itemId) {
                    return null;
                  }

                  return (
                    <div
                      key={itemId}
                      className="p-4 md:p-6 hover:bg-linear-to-r hover:from-accent/5 hover:to-transparent transition-all duration-300 group"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Product Image & Info */}
                        <div className="flex-1 flex gap-4">
                          <div className="h-24 w-24 shrink-0 bg-linear-to-br from-background-secondary to-background-tertiary/30 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                            {item.product?.images?.[0] ? (
                              <Image
                                src={
                                  typeof item.product.images[0] === "string"
                                    ? item.product.images[0]
                                    : item.product.images[0].url
                                }
                                alt={item.product?.name || "Product"}
                                width={96}
                                height={96}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-background-secondary to-accent/10">
                                <span className="text-3xl">🛒</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-foreground text-lg leading-tight group-hover:text-accent transition-colors duration-200">
                                  {item.product?.name || "Product"}
                                </h3>
                                <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                                  {item.product?.description}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(itemId)}
                                disabled={isMutating}
                                className="md:hidden text-foreground-muted hover:text-destructive transition-all duration-200 p-1 rounded-lg hover:bg-destructive/10 hover:scale-110 disabled:opacity-50"
                                aria-label="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            {/* Variants */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.color && (
                                <span className="inline-flex items-center gap-1.5 text-xs bg-linear-to-r from-background-secondary to-background-tertiary/30 px-2.5 py-1 rounded-full text-foreground-muted border border-border/30">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                                    style={{
                                      backgroundColor: item.color.toLowerCase(),
                                    }}
                                  />
                                  {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span className="inline-flex items-center gap-1.5 text-xs bg-linear-to-r from-background-secondary to-background-tertiary/30 px-2.5 py-1 rounded-full text-foreground-muted border border-border/30">
                                  <span className="font-medium">Size:</span>{" "}
                                  {item.size}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price (Mobile) */}
                        <div className="md:hidden flex items-center justify-between pt-3 border-t border-border/30">
                          <div>
                            <span className="text-sm text-foreground-muted">
                              Price
                            </span>
                            <div className="text-lg font-bold text-foreground">
                              ${(item.product?.price || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-foreground-muted">
                              Total
                            </span>
                            <div className="text-lg font-bold text-accent">
                              $
                              {(
                                (item.product?.price || 0) * item.quantity
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Price (Desktop) */}
                        <div className="hidden md:block md:w-32 text-center">
                          <div className="text-lg font-bold text-foreground">
                            ${(item.product?.price || 0).toFixed(2)}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="md:w-40">
                          <div className="flex items-center gap-2 justify-center">
                            <button
                              onClick={() =>
                                handleDecrement(itemId, item.quantity)
                              }
                              disabled={item.quantity <= 1 || isMutating}
                              className="h-10 w-10 rounded-lg border-2 border-border/50 bg-card flex items-center justify-center text-foreground hover:bg-accent/5 hover:border-accent/30 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              aria-label="Decrease quantity"
                            >
                              <Minus
                                size={16}
                                className="text-foreground-muted group-hover:text-accent transition-colors"
                              />
                            </button>

                            <div className="w-12 text-center">
                              <span className="text-lg font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                                {item.quantity}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                handleIncrement(
                                  itemId,
                                  item.quantity,
                                  item.product?.stock || 0,
                                )
                              }
                              disabled={
                                item.quantity >= (item.product?.stock || 0) ||
                                isMutating
                              }
                              className="h-10 w-10 rounded-lg border-2 border-border/50 bg-card flex items-center justify-center text-foreground hover:bg-accent/5 hover:border-accent/30 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              aria-label="Increase quantity"
                            >
                              <Plus
                                size={16}
                                className="text-foreground-muted group-hover:text-accent transition-colors"
                              />
                            </button>
                          </div>
                          {item.quantity >= (item.product?.stock || 0) && (
                            <p className="text-xs text-destructive mt-1.5 text-center font-medium animate-pulse">
                              Max stock reached
                            </p>
                          )}
                        </div>

                        {/* Total & Remove (Desktop) */}
                        <div className="hidden md:flex md:w-32 items-center justify-end gap-3">
                          <div className="text-lg font-bold bg-linear-to-r from-accent to-accent-light bg-clip-text text-transparent">
                            $
                            {(
                              (item.product?.price || 0) * item.quantity
                            ).toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(itemId)}
                            disabled={isMutating}
                            className="text-foreground-muted hover:text-destructive transition-all duration-200 p-1.5 rounded-lg hover:bg-destructive/10 hover:scale-110 disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Actions */}
              <div className="p-6 bg-linear-to-r from-background-secondary/50 to-background-secondary/20 border-t border-border/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="gap-2 border-2 border-border/50 hover:border-accent/30 hover:bg-accent/5 text-foreground px-6 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                    >
                      <ArrowLeft size={16} />
                      Continue Shopping
                    </Button>
                  </Link>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="gap-2 border-2 border-border/50 hover:border-accent/30 hover:bg-accent/5 text-foreground rounded-xl transition-all duration-200 hover:shadow-md"
                      onClick={() => refetch()}
                      disabled={isMutating}
                    >
                      <RefreshCw
                        size={16}
                        className={isMutating ? "animate-spin" : ""}
                      />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 text-destructive hover:text-destructive border-2 border-destructive/20 hover:border-destructive/40 hover:bg-destructive/5 rounded-xl transition-all duration-200 hover:shadow-md"
                      onClick={handleClearCart}
                      disabled={isClearing || isMutating}
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
              {/* Trust badges content... */}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-card rounded-2xl shadow-xl border-2 border-border/30 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-serif bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                    Order Summary
                  </h2>
                  <div className="flex items-center gap-1 text-xs bg-accent/5 px-3 py-1 rounded-full border border-accent/10">
                    <Sparkles size={12} className="text-accent" />
                    <span className="text-foreground-muted">
                      {itemCount} items
                    </span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Tag
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
                        size={16}
                      />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        placeholder="Promo code"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-border/50 bg-input text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                      />
                    </div>
                    <Button
                      onClick={handleApplyPromo}
                      variant="outline"
                      disabled={isApplyingCoupon || isMutating}
                      className="border-2 border-border/50 hover:border-accent/30 hover:bg-accent/5 text-foreground rounded-xl px-6 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>

                  {appliedPromo && (
                    <div className="flex items-center justify-between p-3 bg-linear-to-r from-success/10 to-success/5 rounded-xl border-2 border-success/20 animate-fade-in">
                      <div>
                        <div className="font-medium text-success flex items-center gap-1">
                          ✨ {appliedPromo.code} applied
                        </div>
                        <div className="text-sm text-success/80">
                          {appliedPromo.description}
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        disabled={isRemovingCoupon || isMutating}
                        className="text-success hover:text-success/80 transition-colors p-1 rounded-lg hover:bg-success/10 disabled:opacity-50"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  {/* Available Promo Codes */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Gift size={12} />
                      Available promo codes
                    </p>
                    <div className="space-y-1.5">
                      {promoCodes.map((promo) => (
                        <div
                          key={promo.code}
                          className="flex items-center justify-between text-xs bg-linear-to-r from-background-secondary/50 to-background-secondary/20 px-3 py-2 rounded-lg border border-border/30"
                        >
                          <code className="font-mono font-semibold text-foreground text-xs">
                            {promo.code}
                          </code>
                          <span className="text-foreground-muted">
                            {promo.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-1 group">
                    <span className="text-foreground-muted">Subtotal</span>
                    <span className="font-medium text-foreground">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 group">
                    <span className="text-foreground-muted">Shipping</span>
                    <span
                      className={`font-medium ${
                        shipping === 0 ? "text-success" : "text-foreground"
                      }`}
                    >
                      {shipping === 0 ? "FREE 🎉" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between py-1 group">
                      <span className="text-foreground-muted">Discount</span>
                      <span className="font-medium text-success">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 group">
                    <span className="text-foreground-muted">Tax</span>
                    <span className="font-medium text-foreground">
                      ${tax.toFixed(2)}
                    </span>
                  </div>

                  <div className="pt-4 border-t-2 border-border/50">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-foreground">
                        Total
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold bg-linear-to-r from-accent to-accent-light bg-clip-text text-transparent">
                          ${total.toFixed(2)}
                        </span>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          Including ${tax.toFixed(2)} in taxes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading || cartItems.length === 0 || isMutating}
                  className="w-full py-4 text-base font-semibold bg-linear-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles
                          size={18}
                          className="group-hover:rotate-12 transition-transform"
                        />
                        Proceed to Checkout
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>

                {/* Payment Methods */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-foreground-muted uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
                    <span className="w-8 h-px bg-border"></span>
                    We accept
                    <span className="w-8 h-px bg-border"></span>
                  </p>
                  <div className="flex justify-center gap-3">
                    <div className="h-9 w-14 bg-linear-to-br from-background-secondary to-background-tertiary/30 rounded-lg flex items-center justify-center shadow-sm border border-border/30 hover:border-accent/30 transition-all duration-200 hover:shadow-md hover:scale-105">
                      <span className="font-bold text-foreground text-xs">
                        VISA
                      </span>
                    </div>
                    <div className="h-9 w-14 bg-linear-to-br from-background-secondary to-background-tertiary/30 rounded-lg flex items-center justify-center shadow-sm border border-border/30 hover:border-accent/30 transition-all duration-200 hover:shadow-md hover:scale-105">
                      <span className="font-bold text-foreground text-xs">
                        MC
                      </span>
                    </div>
                    <div className="h-9 w-14 bg-linear-to-br from-background-secondary to-background-tertiary/30 rounded-lg flex items-center justify-center shadow-sm border border-border/30 hover:border-accent/30 transition-all duration-200 hover:shadow-md hover:scale-105">
                      <span className="font-bold text-foreground text-xs">
                        PP
                      </span>
                    </div>
                    <div className="h-9 w-14 bg-linear-to-br from-background-secondary to-background-tertiary/30 rounded-lg flex items-center justify-center shadow-sm border border-border/30 hover:border-accent/30 transition-all duration-200 hover:shadow-md hover:scale-105">
                      <span className="text-xl">🍎</span>
                    </div>
                  </div>
                </div>

                {/* Cart Summary */}
                <div className="mt-6 pt-4 border-t-2 border-border/50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-foreground-muted">Items</span>
                      <span className="font-medium text-foreground">
                        {itemCount}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-foreground-muted">Delivery</span>
                      <span className="font-medium text-foreground text-xs">
                        3-5 days
                      </span>
                    </div>
                    <div className="flex justify-between py-1 col-span-2">
                      <span className="text-foreground-muted">Returns</span>
                      <span className="font-medium text-foreground text-xs">
                        30 days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-linear-to-r from-primary/5 to-accent/5 rounded-xl border-2 border-primary/10 backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="text-primary" size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-primary font-medium flex items-center gap-1">
                      🔒 Secure checkout
                      <Sparkles size={12} className="text-accent" />
                    </p>
                    <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
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
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold font-serif bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              Frequently Bought Together
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-border to-transparent"></div>
            <Sparkles size={18} className="text-accent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Phone Stand", price: 24.99, image: "📱" },
              { name: "Screen Protector", price: 12.99, image: "🛡️" },
              { name: "USB-C Cable", price: 15.99, image: "🔌" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-4 flex items-center gap-4 border-2 border-border/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/40 hover:scale-[1.02] group"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <div className="h-16 w-16 bg-linear-to-br from-background-secondary to-background-tertiary/30 rounded-xl flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform duration-300">
                  {item.image}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm truncate group-hover:text-accent transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-lg font-bold bg-linear-to-r from-accent to-accent-light bg-clip-text text-transparent">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-linear-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-primary-foreground rounded-lg px-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
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
