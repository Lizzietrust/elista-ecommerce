"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, Filter, X } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { useSearchProducts } from "@/lib/hooks/use-products";
import { Button } from "@/components/ui/button";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState<
    "relevance" | "price-asc" | "price-desc"
  >("relevance");

  const { data: products, isLoading, error } = useSearchProducts(query, 50);

  const sortedProducts = products ? [...products] : [];
  if (sortBy === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }

  if (!query) {
    router.push("/products");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Search size={20} />
            <span>Search results for</span>
            <span className="font-semibold text-foreground">"{query}"</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isLoading
              ? "Searching..."
              : `${sortedProducts.length} Results Found`}
          </h1>
          {!isLoading && !error && (
            <p className="text-muted-foreground">
              Showing {sortedProducts.length} product
              {sortedProducts.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Sort and Filter Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={sortBy === "relevance" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("relevance")}
            >
              Relevance
            </Button>
            <Button
              variant={sortBy === "price-asc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price-asc")}
            >
              Price: Low to High
            </Button>
            <Button
              variant={sortBy === "price-desc" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("price-desc")}
            >
              Price: High to Low
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-100">
            <Loader2 size={48} className="animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Search Error</h3>
            <p className="text-muted-foreground">
              Failed to load search results. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !error && sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any products matching "{query}"
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Try:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li>Checking your spelling</li>
                <li>Using fewer or more general keywords</li>
                <li>Browsing our categories</li>
              </ul>
              <Button onClick={() => router.push("/products")} className="mt-4">
                Browse All Products
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && sortedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 size={48} className="animate-spin text-accent" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
