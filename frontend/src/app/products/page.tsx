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
import { useCategories } from "@/lib/hooks/use-categories";
import type { Product } from "@/types";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const categoryId = searchParams.get("category") || undefined;
  const sort = searchParams.get("sort") || "-createdAt";
  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("q") || undefined;
  const brand = searchParams.get("brand") || undefined;

  const { data: categoriesData } = useCategories({ isActive: true });
  const allCategories = categoriesData?.data || [];

  const selectedCategoryName = categoryId
    ? allCategories.find(
        (cat: { _id: string; name: string }) => cat._id === categoryId,
      )?.name || categoryId
    : undefined;

  const apiParams = {
    category: categoryId,
    sort,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    page,
    limit: 12,
    search: searchQuery,
    ...(brand && { brand }),
  };

  const {
    data: productsData,
    isLoading,
    error,
    isError,
    isRefetching,
    refetch,
  } = useProducts({
    endpoint: "all",
    params: apiParams,
    options: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
    },
  });

  const products: Product[] = productsData?.data || [];
  const totalCount = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 0;
  const currentPage = productsData?.currentPage || 1;

  const productCategories: string[] = [
    ...new Set(
      products
        .map((p: Product) =>
          typeof p.category === "object" ? p.category?.name : p.category,
        )
        .filter(Boolean) as string[],
    ),
  ];

  const productBrands: string[] = [
    ...new Set(
      products.map((p: Product) => p.brand).filter(Boolean) as string[],
    ),
  ];

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters =
    categoryId || minPrice || maxPrice || searchQuery || brand;

  const handleCategoryChange = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryName && categoryName.trim() !== "") {
      const category = allCategories.find(
        (cat: { name: string }) => cat.name === categoryName,
      );
      if (category) {
        params.set("category", category._id);
      } else {
        params.delete("category");
      }
    } else {
      params.delete("category");
    }

    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handleBrandChange = (brandName: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (brandName && brandName.trim() !== "") {
      params.set("brand", brandName);
    } else {
      params.delete("brand");
    }

    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

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
        <div className="mb-8 animate-slide-down">
          <div className="relative">
            <div className="absolute -top-4 left-0 w-20 h-1 bg-linear-to-r from-accent to-primary rounded-full"></div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-3 tracking-tight">
              Our <span className="text-accent">Products</span>
            </h1>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-0.5 bg-accent/50"></div>
              <p className="text-foreground-muted text-base md:text-lg">
                Discover our collection of{" "}
                <span className="font-semibold text-accent">{totalCount}</span>{" "}
                amazing products
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              variant="outline"
              className="w-full gap-2 border-border hover:border-accent hover:bg-accent/5 transition-all duration-300"
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-2 w-2 rounded-full bg-accent animate-pulse" />
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
              categories={productCategories}
              brands={productBrands}
              selectedCategory={selectedCategoryName}
              selectedMinPrice={minPrice}
              selectedMaxPrice={maxPrice}
              selectedBrand={brand}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
            />
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="mt-4 w-full gap-2 text-accent hover:text-accent-light hover:bg-accent/10 transition-all duration-300"
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
              <div className="text-sm text-foreground-muted bg-background-secondary/50 px-4 py-2 rounded-full">
                {!isLoading && products.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {(currentPage - 1) * 12 + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(currentPage * 12, totalCount)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-accent">
                      {totalCount}
                    </span>{" "}
                    products
                  </>
                ) : (
                  <span>Loading products...</span>
                )}
              </div>

              {/* Sort Dropdown with higher z-index */}
              <div className="relative z-50">
                <ProductSort currentSort={sort} />
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product: Product, index: number) => (
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
              <div className="text-center py-16 bg-background-secondary/50 backdrop-blur-sm rounded-2xl border border-border">
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
                    className="mt-6 gap-2 border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
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

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index: number) => (
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
