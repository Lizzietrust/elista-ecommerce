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
  Heart,
  CreditCard,
  Wallet,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import {
  useCart,
  useRemoveFromCart,
  useClearCart,
  useIncrementCartItem,
  useDecrementCartItem,
  useApplyCoupon,
  useRemoveCoupon,
  useMoveToWishlist,
  useAvailableCoupons,
  useAvailablePaymentMethods,
  useCheckout,
} from "@/lib/hooks/use-cart";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";

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

  const { data: availableCoupons, isLoading: isCouponsLoading } =
    useAvailableCoupons();

  const { data: paymentMethods, isLoading: isPaymentMethodsLoading } =
    useAvailablePaymentMethods();

  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();
  const { mutate: incrementItem, isPending: isIncrementing } =
    useIncrementCartItem();
  const { mutate: decrementItem, isPending: isDecrementing } =
    useDecrementCartItem();
  const { mutate: applyCoupon, isPending: isApplyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: isRemovingCoupon } =
    useRemoveCoupon();
  const { mutate: moveToWishlist, isPending: isMovingToWishlist } =
    useMoveToWishlist();
  const { mutate: checkout, isPending: isCheckingOut } = useCheckout();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    description: string;
  } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });

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

  const handleMoveToWishlist = (itemId: string) => {
    moveToWishlist(itemId, {
      onSuccess: () => {
        toast.success("Item moved to wishlist", {
          duration: 2000,
          position: "bottom-center",
        });
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to move to wishlist", {
          duration: 3000,
          position: "bottom-center",
        });
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
    if (
      !shippingAddress.fullName ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode ||
      !shippingAddress.phone
    ) {
      toast.error("Please fill in all shipping address fields");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const paymentMethod = paymentMethods?.find(
      (p) => p.id === selectedPaymentMethod,
    );
    if (!paymentMethod || !paymentMethod.isAvailable) {
      toast.error("Selected payment method is not available");
      return;
    }

    setIsLoading(true);

    checkout(
      {
        shippingAddress,
        paymentMethod: paymentMethod,
      },
      {
        onSuccess: (response) => {
          setIsLoading(false);
          setShowCheckoutModal(false);

          const orderData = response.data?.order;
          const paymentIntent = response.data?.paymentIntent;

          toast.success("Order placed successfully!", {
            duration: 3000,
            position: "bottom-center",
          });

          if (paymentIntent?.clientSecret) {
            router.push(
              `/payment/${orderData?._id}?clientSecret=${paymentIntent.clientSecret}`,
            );
          } else {
            router.push(`/order-confirmation/${orderData?._id}`);
          }
        },
        onError: (error: any) => {
          setIsLoading(false);
          toast.error(error?.message || "Checkout failed. Please try again.");
        },
      },
    );
  };

  const openCheckoutModal = () => {
    setShowCheckoutModal(true);
  };

  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
    setIsLoading(false);
  };

  const getDisplayPrice = (item: any) => {
    return item.product?.price || item.priceAtAdd || 0;
  };

  const getDiscountDescription = (coupon: any) => {
    switch (coupon.discountType) {
      case "percentage":
        return `${coupon.discountValue}% off${
          coupon.maxDiscountAmount ? ` (max $${coupon.maxDiscountAmount})` : ""
        }`;
      case "fixed":
        return `$${coupon.discountValue} off`;
      case "free_shipping":
        return "Free shipping";
      default:
        return "Discount";
    }
  };

  const isMutating =
    isRemoving ||
    isClearing ||
    isIncrementing ||
    isDecrementing ||
    isMovingToWishlist;

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

                  const price = getDisplayPrice(item);
                  const itemTotal = price * item.quantity;

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
                              <div className="md:hidden flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveToWishlist(itemId)}
                                  disabled={isMutating}
                                  className="text-foreground-muted hover:text-primary transition-all duration-200 p-1 rounded-lg hover:bg-primary/10 hover:scale-110 disabled:opacity-50"
                                  aria-label="Move to wishlist"
                                  title="Save for later"
                                >
                                  <Heart size={18} />
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(itemId)}
                                  disabled={isMutating}
                                  className="text-foreground-muted hover:text-destructive transition-all duration-200 p-1 rounded-lg hover:bg-destructive/10 hover:scale-110 disabled:opacity-50"
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>

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
                              ${price.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-foreground-muted">
                              Total
                            </span>
                            <div className="text-lg font-bold text-accent">
                              ${itemTotal.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Price (Desktop) */}
                        <div className="hidden md:block md:w-32 text-center">
                          <div className="text-lg font-bold text-foreground">
                            ${price.toFixed(2)}
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

                        {/* Total & Actions (Desktop) */}
                        <div className="hidden md:flex md:w-32 items-center justify-end gap-3">
                          <div className="text-lg font-bold bg-linear-to-r from-accent to-accent-light bg-clip-text text-transparent min-w-17.5 text-right">
                            ${itemTotal.toFixed(2)}
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveToWishlist(itemId)}
                              disabled={isMutating}
                              className="text-foreground-muted hover:text-primary transition-all duration-200 p-1 rounded-lg hover:bg-primary/10 hover:scale-110 disabled:opacity-50"
                              aria-label="Move to wishlist"
                              title="Save for later"
                            >
                              <Heart size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(itemId)}
                              disabled={isMutating}
                              className="text-foreground-muted hover:text-destructive transition-all duration-200 p-1 rounded-lg hover:bg-destructive/10 hover:scale-110 disabled:opacity-50"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
              <div className="bg-card rounded-xl p-5 flex items-center gap-4 border-2 border-border/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/30 hover:scale-[1.02] group">
                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-primary" size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-1">
                    Secure Payment
                    <Sparkles size={12} className="text-accent" />
                  </h4>
                  <p className="text-xs text-foreground-muted">
                    Your data is protected
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 flex items-center gap-4 border-2 border-border/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-success/30 hover:scale-[1.02] group">
                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-success/10 to-success/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="text-success" size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-1">
                    Free Shipping
                    <Gift size={12} className="text-success" />
                  </h4>
                  <p className="text-xs text-foreground-muted">
                    On orders over $50
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-5 flex items-center gap-4 border-2 border-border/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/30 hover:scale-[1.02] group">
                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-accent/10 to-accent/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="text-accent" size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-1">
                    Easy Returns
                    <Star size={12} className="text-accent" />
                  </h4>
                  <p className="text-xs text-foreground-muted">
                    30-day return policy
                  </p>
                </div>
              </div>
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
                        placeholder="Enter promo code"
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
                      {isCouponsLoading && (
                        <Loader2 size={12} className="animate-spin ml-1" />
                      )}
                    </p>
                    {availableCoupons && availableCoupons.length > 0 ? (
                      <div className="space-y-1.5">
                        {availableCoupons.map((coupon) => (
                          <button
                            key={coupon._id}
                            onClick={() => {
                              setPromoCode(coupon.code);
                              setTimeout(() => {
                                if (promoCode === coupon.code) {
                                  handleApplyPromo();
                                }
                              }, 100);
                            }}
                            className="w-full flex items-center justify-between text-xs bg-linear-to-r from-background-secondary/50 to-background-secondary/20 px-3 py-2 rounded-lg border border-border/30 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group"
                            disabled={isApplyingCoupon || isMutating}
                          >
                            <code className="font-mono font-semibold text-foreground text-xs group-hover:text-accent transition-colors">
                              {coupon.code}
                            </code>
                            <span className="text-foreground-muted group-hover:text-foreground transition-colors px-2">
                              {getDiscountDescription(coupon)}
                            </span>
                            {coupon.minPurchaseAmount &&
                              coupon.minPurchaseAmount > 0 && (
                                <span className="text-[10px] text-foreground-muted/60">
                                  Min. ${coupon.minPurchaseAmount}
                                </span>
                              )}
                            <span className="text-xs text-accent/50 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to apply
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      !isCouponsLoading && (
                        <p className="text-xs text-foreground-muted/60 text-center py-2">
                          No active promo codes available at the moment
                        </p>
                      )
                    )}
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
                  onClick={openCheckoutModal}
                  disabled={isLoading || cartItems.length === 0 || isMutating}
                  className="w-full py-4 text-base font-semibold bg-linear-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles
                      size={18}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    Proceed to Checkout
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>

                {/* Payment Methods Preview */}
                {paymentMethods && paymentMethods.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-foreground-muted uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
                      <span className="w-8 h-px bg-border"></span>
                      We accept
                      <span className="w-8 h-px bg-border"></span>
                    </p>
                    <div className="flex justify-center gap-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`h-9 w-14 bg-linear-to-br from-background-secondary to-background-tertiary/30 rounded-lg flex items-center justify-center shadow-sm border transition-all duration-200 ${
                            method.isAvailable
                              ? "border-border/30 hover:border-accent/30 hover:shadow-md hover:scale-105"
                              : "border-border/20 opacity-50 cursor-not-allowed"
                          }`}
                          title={
                            method.isAvailable
                              ? method.name
                              : `${method.name} - Coming Soon`
                          }
                        >
                          <span className="text-xs font-bold text-foreground">
                            {method.icon}
                          </span>
                        </div>
                      ))}
                    </div>
                    {paymentMethods.some((m) => m.comingSoon) && (
                      <p className="text-[10px] text-foreground-muted/60 text-center mt-2">
                        More payment options coming soon!
                      </p>
                    )}
                  </div>
                )}

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
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border/50 animate-slide-up">
            <div className="sticky top-0 bg-card border-b border-border/50 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold font-serif bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                Checkout
              </h2>
              <button
                onClick={closeCheckoutModal}
                className="p-2 rounded-lg hover:bg-background-secondary transition-colors"
                disabled={isLoading}
              >
                <X size={20} className="text-foreground-muted" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-background-secondary/50 rounded-xl p-4 border border-border/30">
                <h3 className="font-semibold text-foreground mb-2">
                  Order Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Subtotal</span>
                    <span className="text-foreground">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Shipping</span>
                    <span className="text-foreground">
                      ${shipping.toFixed(2)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t border-border/30">
                    <span>Total</span>
                    <span className="text-accent">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-accent" />
                  Shipping Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="px-4 py-3 rounded-xl border-2 border-border/50 bg-input text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="px-4 py-3 rounded-xl border-2 border-border/50 bg-input text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    className="md:col-span-2 px-4 py-3 rounded-xl border-2 border-border/50 bg-input text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    className="px-4 py-3 rounded-xl border-2 border-border/50 bg-input text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    className="px-4 py-3 rounded-xl border-2 border-border/50 bg-input text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                    className="px-4 py-3 rounded-xl border-2 border-border/50 bg-input text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="md:col-span-2 px-4 py-3 rounded-xl border-2 border-border/50 bg-input text-foreground placeholder:text-foreground-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-accent" />
                  Payment Method
                </h3>
                {isPaymentMethodsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods?.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedPaymentMethod === method.id
                            ? "border-accent bg-accent/5"
                            : method.isAvailable
                              ? "border-border/50 hover:border-accent/30 hover:bg-background-secondary/50"
                              : "border-border/30 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={() =>
                              method.isAvailable &&
                              setSelectedPaymentMethod(method.id)
                            }
                            disabled={!method.isAvailable}
                            className="h-4 w-4 text-accent focus:ring-accent border-border"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{method.icon}</span>
                              <span className="font-medium text-foreground">
                                {method.name}
                              </span>
                              {method.comingSoon && (
                                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                  Coming Soon
                                </span>
                              )}
                              {method.isAvailable && (
                                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                                  Available
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground-muted">
                              {method.description}
                            </p>
                            {method.brands && method.isAvailable && (
                              <div className="flex gap-2 mt-1">
                                {method.brands.map((brand) => (
                                  <span
                                    key={brand}
                                    className="text-xs text-foreground-muted/60"
                                  >
                                    {brand}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {method.isAvailable &&
                          selectedPaymentMethod === method.id && (
                            <div className="text-accent">
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                      </label>
                    ))}
                    {!paymentMethods ||
                      (paymentMethods.length === 0 && (
                        <p className="text-center text-foreground-muted py-4">
                          No payment methods available
                        </p>
                      ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={closeCheckoutModal}
                  disabled={isLoading}
                  className="flex-1 border-2 border-border/50 hover:border-accent/30 hover:bg-accent/5 text-foreground rounded-xl transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading || !selectedPaymentMethod}
                  className="flex-1 bg-linear-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Place Order • $${total.toFixed(2)}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
