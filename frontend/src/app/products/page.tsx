"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductFilters from "@/components/products/product-filters";
import ProductSort from "@/components/products/product-sort";
import Pagination from "@/components/ui/pagination";
import { ProductCard } from "@/components/products/product-card";
import { useProducts } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, Filter, X } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Get filter params from URL
  const category = searchParams.get("category") || undefined;
  const sort = searchParams.get("sort") || "-createdAt";
  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("q") || undefined;

  const {
    data: productsData,
    isLoading,
    error,
    isError,
    isRefetching,
    refetch,
  } = useProducts(
    {
      category,
      sort,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      page,
      limit: 12,
      search: searchQuery,
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
    },
  );

  const products = productsData?.data || [];
  const totalCount = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 0;
  const currentPage = productsData?.currentPage || 1;

  // Get unique categories and brands for filters from the products data
  const categories = [
    ...new Set(
      products.map((p) =>
        typeof p.category === "object" ? p.category.name : p.category,
      ),
    ),
  ].filter(Boolean);

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters = category || minPrice || maxPrice || searchQuery;

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-destructive/10 rounded-lg p-8">
              <p className="text-destructive font-semibold mb-2">
                Unable to load products
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl font-bold text-gradient-earth mb-2">
            Our Products
          </h1>
          <p className="text-foreground-muted">
            Discover our collection of {totalCount} amazing products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              variant="outline"
              className="w-full gap-2 border-border"
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-2 w-2 rounded-full bg-accent" />
              )}
            </Button>
          </div>

          {/* Sidebar Filters */}
          <div
            className={`lg:w-1/4 ${
              isMobileFilterOpen
                ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-6 overflow-y-auto"
                : "hidden lg:block"
            }`}
          >
            {isMobileFilterOpen && (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Filters</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-background-secondary rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <ProductFilters
              categories={categories}
              brands={brands}
              selectedCategory={category}
              selectedMinPrice={minPrice}
              selectedMaxPrice={maxPrice}
            />
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="mt-4 w-full gap-2 text-accent hover:text-accent-light"
              >
                <RefreshCw size={16} />
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header with sort and results count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="text-sm text-foreground-muted">
                {!isLoading && products.length > 0 ? (
                  <>
                    Showing {(currentPage - 1) * 12 + 1} -{" "}
                    {Math.min(currentPage * 12, totalCount)} of {totalCount}{" "}
                    products
                  </>
                ) : (
                  <span>Loading products...</span>
                )}
              </div>
              <ProductSort currentSort={sort} />
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <div
                      key={product._id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-background-secondary rounded-2xl border border-border">
                <div className="h-20 w-20 bg-background-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-foreground-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-foreground-muted max-w-md mx-auto">
                  Try adjusting your filters or search criteria
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-6 gap-2"
                  >
                    <RefreshCw size={16} />
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-background-secondary rounded-xl aspect-square mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-background-secondary rounded w-3/4"></div>
            <div className="h-4 bg-background-secondary rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-background-secondary rounded w-20"></div>
              <div className="h-6 bg-background-secondary rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
