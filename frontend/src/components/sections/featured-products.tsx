"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useFeaturedProducts } from "@/lib/hooks/use-products";
import { Button } from "@/components/ui/button";
import { FeaturedProductsSkeleton } from "../ui/skeleton";
import { ProductCard } from "../products/product-card";

export default function FeaturedProducts() {
  const {
    data: products,
    isLoading,
    error,
    isError,
    isRefetching,
    refetch,
  } = useFeaturedProducts(8, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return <FeaturedProductsSkeleton />;
  }

  if (isError) {
    return (
      <section className="py-12 md:py-16 bg-background-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center">
            <div className="bg-destructive/10 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-destructive font-semibold mb-2">
                Unable to load featured products
              </p>
              <p className="text-foreground-muted text-sm mb-4">
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

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-background-secondary">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-earth mb-3">
            Featured Products
          </h2>
          <p className="text-foreground-muted max-w-2xl mx-auto">
            Handpicked items just for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
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
