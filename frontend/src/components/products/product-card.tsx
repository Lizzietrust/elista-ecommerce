"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  Loader2,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { Product, Category, ProductImage } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  useAddToCart,
  useCart,
  useRemoveFromCart,
  useIncrementCartItem,
  useDecrementCartItem,
} from "@/lib/hooks/use-cart";
import {
  useCheckInWishlist,
  useToggleWishlist,
} from "@/lib/hooks/use-wishlist";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useProductReviews } from "@/lib/hooks/use-reviews";
import type { WishlistItem } from "@/lib/api/wishlist";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
}

interface CheckInWishlistResponse {
  isInWishlist: boolean;
  itemDetails?: WishlistItem;
}

const isNewArrival = (createdAt: string | undefined): boolean => {
  if (!createdAt) return false;

  const productDate = new Date(createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - productDate.getTime()) / (1000 * 3600 * 24);
  return daysDiff <= 30;
};

export function ProductCard({ product }: ProductCardProps) {
  console.log({ product });

  const router = useRouter();
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState<number>(0);

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { mutate: removeFromCart, isPending: isRemovingFromCart } =
    useRemoveFromCart();
  const { mutate: incrementItem, isPending: isIncrementing } =
    useIncrementCartItem();
  const { mutate: decrementItem, isPending: isDecrementing } =
    useDecrementCartItem();

  // Get cart data to check if product is in cart
  const { data: cartData, isLoading: isLoadingCart } = useCart();

  const isAuthenticated =
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false;

  const productId = (product._id ?? product.id) as string;

  // Check if product is in cart and get its quantity
  useEffect(() => {
    if (cartData?.items) {
      const cartItem = cartData.items.find(
        (item) =>
          item.product._id === productId || item.product.id === productId,
      );
      if (cartItem) {
        setCartItemId(cartItem._id);
        setCartQuantity(cartItem.quantity);
        setIsAddedToCart(true);
      } else {
        setCartItemId(null);
        setCartQuantity(0);
        setIsAddedToCart(false);
      }
    }
  }, [cartData, productId]);

  const { data: wishlistData, isLoading: isCheckingWishlist } =
    useCheckInWishlist(productId, {
      enabled: isAuthenticated && !!productId,
    });

  const wishlistCheckData = wishlistData as CheckInWishlistResponse | undefined;
  const isInWishlist = wishlistCheckData?.isInWishlist ?? false;

  const { mutate: toggleWishlist, isPending: isTogglingWishlist } =
    useToggleWishlist();

  const { data: reviewData, isLoading: isLoadingReviews } = useProductReviews(
    productId,
    { limit: 1 },
    { enabled: productId.length > 0 },
  );

  const averageRating =
    reviewData?.statistics?.averageRating ?? product.averageRating ?? 0;

  const totalReviews =
    reviewData?.statistics?.totalReviews ?? product.ratingsCount ?? 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    if (product.stock === 0) {
      toast.error("Product is out of stock", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    addToCart(
      { productId, quantity: 1 },
      {
        onSuccess: (response) => {
          setIsAddedToCart(true);
          if (response?.data?.items) {
            const addedItem = response.data.items.find(
              (item) =>
                item.product._id === productId || item.product.id === productId,
            );
            if (addedItem) {
              setCartItemId(addedItem._id);
              setCartQuantity(addedItem.quantity);
            }
          }
        },
        onError: (error) => {
          console.error("Add to cart error:", error);
        },
      },
    );
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItemId) return;

    incrementItem(cartItemId, {
      onSuccess: (response) => {
        if (response?.data) {
          setCartQuantity(response.data.quantity);
        }
      },
      onError: (error) => {
        console.error("Increment error:", error);
      },
    });
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItemId) return;

    if (cartQuantity === 1) {
      // Remove item from cart
      removeFromCart(cartItemId, {
        onSuccess: () => {
          setIsAddedToCart(false);
          setCartItemId(null);
          setCartQuantity(0);
        },
        onError: (error) => {
          console.error("Remove from cart error:", error);
        },
      });
    } else {
      decrementItem(cartItemId, {
        onSuccess: (response) => {
          if (response?.data) {
            if (response.data.removed) {
              setIsAddedToCart(false);
              setCartItemId(null);
              setCartQuantity(0);
            } else {
              setCartQuantity(response.data.quantity);
            }
          }
        },
        onError: (error) => {
          console.error("Decrement error:", error);
        },
      });
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to manage your wishlist", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    toggleWishlist(
      {
        product,
        isInWishlist,
      },
      {
        onSuccess: (data) => {
          if (data?.action === "added") {
            toast.success("Added to wishlist! ❤️", {
              duration: 2000,
              position: "bottom-center",
            });
          } else if (data?.action === "removed") {
            toast.success("Removed from wishlist", {
              duration: 2000,
              position: "bottom-center",
            });
          }
        },
        onError: (error: any) => {
          console.error("Toggle wishlist error:", error);
          toast.error(error?.message || "Failed to update wishlist", {
            duration: 3000,
            position: "bottom-center",
          });
        },
      },
    );
  };

  const getCategoryName = (): string => {
    if (typeof product.category === "string") {
      return product.category;
    }
    if (product.category && typeof product.category === "object") {
      return (product.category as Category).name;
    }
    return "Uncategorized";
  };

  const isLoading = isCheckingWishlist || isTogglingWishlist;
  const isCartLoading =
    isLoadingCart ||
    isAddingToCart ||
    isRemovingFromCart ||
    isIncrementing ||
    isDecrementing;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
          <Image
            src={
              (typeof product.images[0] === "string"
                ? product.images[0]
                : (product.images[0] as ProductImage)?.url) ||
              "/images/placeholder.jpg"
            }
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {isAuthenticated && (
            <button
              onClick={handleToggleWishlist}
              disabled={isLoading}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center transition-all duration-200 z-10 hover:bg-muted hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin text-accent" />
              ) : (
                <Heart
                  size={16}
                  className={`transition-colors duration-200 ${
                    isInWishlist
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  }`}
                  fill={isInWishlist ? "currentColor" : "none"}
                />
              )}
            </button>
          )}

          {isNewArrival(product.createdAt) && product.isActive && (
            <div className="absolute top-2 left-2 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground z-10 shadow-md">
              NEW
            </div>
          )}

          {product.isFeatured && (
            <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground z-10">
              Featured
            </div>
          )}

          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute top-2 left-20 rounded-full bg-warning px-2 py-1 text-xs font-semibold text-warning-foreground z-10">
              {product.stock} left
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute top-2 left-2 rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground z-10">
              Out of Stock
            </div>
          )}

          {product.comparePrice && product.comparePrice > product.price && (
            <div className="absolute bottom-2 left-2 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground z-10">
              SALE
            </div>
          )}

          {isAuthenticated && (
            <div className="absolute bottom-2 right-2 z-10">
              {isAddedToCart && cartQuantity > 0 ? (
                <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-md">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-muted rounded-md"
                    onClick={handleDecrement}
                    disabled={isCartLoading}
                    aria-label="Decrease quantity"
                  >
                    {isDecrementing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                  </Button>

                  <span className="min-w-[20px] text-center text-sm font-semibold">
                    {cartQuantity}
                  </span>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-muted rounded-md"
                    onClick={handleIncrement}
                    disabled={isCartLoading || cartQuantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    {isIncrementing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  size="icon"
                  className="bg-primary hover:bg-primary-light opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  aria-label="Add to cart"
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </Link>

      <Link href={`/products/${product._id}`} className="block">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-1 text-foreground group-hover:text-accent transition-colors duration-200">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(Number(averageRating))
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              {isLoadingReviews ? (
                <Loader2
                  size={12}
                  className="animate-spin text-muted-foreground"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  ({totalReviews})
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-accent">
                  {Math.round((1 - product.price / product.comparePrice) * 100)}
                  % OFF
                </span>
              </>
            )}
          </div>

          <span className="text-xs text-muted-foreground">
            {getCategoryName()}
          </span>
        </CardFooter>
      </Link>

      {!isAuthenticated && (
        <div className="px-4 pb-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push("/login");
            }}
          >
            Sign in to add to cart or wishlist
          </Button>
        </div>
      )}
    </Card>
  );
}
