import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/lib/hooks/use-cart";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { toast } from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product,
      quantity: 1,
      price: product.price,
    });
    toast.success("Added to cart!");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist");
    }
  };

  // Check if product is in wishlist
  const productInWishlist = isInWishlist(product._id);

  // Helper function to get category name
  const getCategoryName = (): string => {
    if (typeof product.category === "string") {
      return product.category;
    } else {
      return (product.category as Category).name;
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0]?.url || "/images/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
            aria-label={
              productInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              size={16}
              className={`transition-colors ${
                productInWishlist
                  ? "fill-red-500 text-red-500"
                  : "text-gray-700 hover:text-red-500"
              }`}
              fill={productInWishlist ? "currentColor" : "none"}
            />
          </button>

          {product.isFeatured && (
            <div className="absolute top-2 left-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground z-10">
              Featured
            </div>
          )}

          {/* Stock Status Badge */}
          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute top-2 left-12 rounded-full bg-amber-500 px-2 py-1 text-xs font-semibold text-white z-10">
              {product.stock} left
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute top-2 left-2 rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-white z-10">
              Out of Stock
            </div>
          )}

          {/* Sale Badge */}
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="absolute bottom-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white z-10">
              SALE
            </div>
          )}

          <Button
            size="icon"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold line-clamp-1">{product.name}</h3>
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
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
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
            <span className="text-xl font-bold">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-red-500">
                  {Math.round((1 - product.price / product.comparePrice) * 100)}
                  % OFF
                </span>
              </>
            )}
          </div>

          {/* Category Tag - Fixed to handle both string and Category object */}
          <span className="text-xs text-muted-foreground">
            {getCategoryName()}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
