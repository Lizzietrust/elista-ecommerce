"use client";

import { useState } from "react";
import { ProductCard } from "@/components/products/product-card";
import { Loader2, Calendar, TrendingUp } from "lucide-react";
import { useNewArrivals } from "@/lib/hooks/use-products";

export default function NewArrivalsPage() {
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(24);

  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useNewArrivals(limit, days);

  const handleDaysChange = (value: number) => {
    setDays(value);
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + 12);
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex justify-center items-center min-h-100">
          <div className="text-center">
            <Loader2
              size={48}
              className="animate-spin text-accent mx-auto mb-4"
            />
            <p className="text-muted-foreground">Loading new arrivals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading new arrivals:", error);
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
          <p className="mb-2">
            Failed to load new arrivals. Please try again later.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
          <Calendar size={16} />
          <span className="text-sm font-medium">New Collection</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          New Arrivals
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the latest products added to our collection. Fresh styles,
          updated weekly.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-accent" />
          <span className="text-sm font-medium text-muted-foreground">
            Showing {products.length} new products
          </span>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-muted-foreground">
            Added in last:
          </label>
          <div className="flex gap-2">
            {[
              { label: "7 days", value: 7 },
              { label: "30 days", value: 30 },
              { label: "60 days", value: 60 },
              { label: "90 days", value: 90 },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleDaysChange(option.value)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  days === option.value
                    ? "bg-accent text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🆕</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No new products yet
          </h3>
          <p className="text-muted-foreground">
            Check back soon for the latest arrivals!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Load More Button - Note: This requires pagination support from API */}
          {products.length >= limit && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin inline mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More Products"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
