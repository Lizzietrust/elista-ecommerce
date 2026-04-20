"use client";

import { Star, ShoppingBag, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useFeaturedProducts } from "@/lib/hooks/use-products";
import { Button } from "@/components/ui/button";
import { FeaturedProductsSkeleton } from "../ui/skeleton";

export default function FeaturedProducts() {
  const {
    data: products,
    isLoading,
    error,
    isError,
    isFetching,
    isRefetching,
    refetch,
    dataUpdatedAt,
    isStale,
  } = useFeaturedProducts(8, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: 1000,
  });

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : null;

  if (isLoading) {
    return <FeaturedProductsSkeleton />;
  }

  if (isError) {
    return (
      <section className="py-12 md:py-16 bg-muted">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center">
            <div className="bg-destructive/10 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-destructive font-semibold mb-2">
                Unable to load featured products
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                {error?.message || "Something went wrong. Please try again."}
              </p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="gap-2"
              >
                {isRefetching ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Try Again
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // if (!products || products.length === 0) {
  //   return null;
  // }

  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Featured Products
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Handpicked items just for you
          </p>

          <div className="flex items-center justify-center gap-2 mt-4">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated}
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
            >
              <RefreshCw
                size={12}
                className={isRefetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products?.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product.slug || product._id}`}
              className="group bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border block"
            >
              <div className="h-48 bg-linear-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <Image
                    src="https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=800&q=80"
                    alt="Product Image"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                )}

                <div className="absolute inset-0 bg-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {isRefetching && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                    <RefreshCw size={24} className="animate-spin text-accent" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                    {typeof product.category === "object"
                      ? product.category.name
                      : product.category}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm line-through text-muted-foreground">
                      ${product.discountPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-accent transition-colors duration-300 line-clamp-1">
                  {product.name}
                </h3>

                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={
                          i < Math.floor(product.averageRating || 0)
                            ? "currentColor"
                            : "none"
                        }
                        className={
                          i < Math.floor(product.averageRating || 0)
                            ? "text-accent"
                            : "text-muted-foreground"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {product.averageRating?.toFixed(1) || "New"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.discountPrice && (
                      <div className="text-xs text-success mt-1">
                        Save $
                        {(product.discountPrice - product.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    className="bg-primary text-primary-foreground rounded-lg hover:bg-primary-light transition-all duration-300 hover:scale-105"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Add to cart:", product._id);
                    }}
                  >
                    <ShoppingBag size={20} />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products?featured=true"
            className="inline-flex items-center gap-2 text-accent font-semibold border-2 border-accent py-3 px-8 rounded-lg hover:bg-accent/10 transition-all duration-300 hover:scale-105"
          >
            View All Products
            <span className="inline-block group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
