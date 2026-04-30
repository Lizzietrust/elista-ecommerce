"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/lib/hooks/use-cart";
import {
  useCheckInWishlist,
  useToggleWishlist,
} from "@/lib/hooks/use-wishlist";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();

  // Check if user is authenticated
  const isAuthenticated =
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false;

  // Only fetch wishlist status if user is authenticated
  const { data: wishlistData, isLoading: isCheckingWishlist } =
    useCheckInWishlist(product._id, {
      enabled: isAuthenticated, // Only run query if authenticated
    });

  const isInWishlist = wishlistData?.data?.isInWishlist || false;

  const { mutate: toggleWishlist, isPending: isTogglingWishlist } =
    useToggleWishlist();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // This should never happen since button is hidden, but keeping for safety
      toast.error("Please login to add items to cart", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    try {
      addItem({
        product,
        quantity: 1,
        price: product.price,
      });
      toast.success("Added to cart!", {
        duration: 2000,
        position: "bottom-center",
      });
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error("Add to cart error:", error);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // This should never happen since button is hidden, but keeping for safety
      toast.error("Please login to manage your wishlist", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    toggleWishlist({
      product,
      isInWishlist,
    });
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

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer">
          <Image
            src={product.images[0]?.url || "/images/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Wishlist Button - Only show if authenticated */}
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

          {/* Add to Cart Button - Only show if authenticated */}
          {isAuthenticated && (
            <Button
              size="icon"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 bg-primary hover:bg-primary-light hover:scale-105"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
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
                      i < Math.floor(product.averageRating || 0)
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount || 0})
              </span>
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

      {/* Optional: Add a subtle login prompt on the card for unauthenticated users */}
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
