"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePaginatedFormattedCategories } from "@/lib/hooks/use-categories";
import CategoryCard from "@/components/ui/category-card";
import Select from "@/components/ui/select";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "productCount" | "createdAt" | ""
  >("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error, refetch } = usePaginatedFormattedCategories({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    sort: sortBy || undefined,
    order: sortBy ? sortOrder : undefined,
    isActive: true,
  });

  const categories = data?.data || [];
  const totalPages = data?.totalPages || 0;
  const totalCategories = data?.total || 0;

  const { data: topCategoriesData } = usePaginatedFormattedCategories({
    page: 1,
    limit: 6,
    sort: "productCount",
    order: "desc",
    isActive: true,
  });

  const topCategories = topCategoriesData?.data || [];

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block">
              <p>Failed to load categories. Please try again later.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section with Stats */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Sparkles size={16} />
            <span className="text-sm font-medium">Discover Collections</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Shop by Category
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Explore our curated collections and find exactly what you're looking
            for
          </p>

          {/* Category Stats */}
          {!isLoading && totalCategories > 0 && (
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span className="text-sm text-muted-foreground">
                  {totalCategories} Categories
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories by name or description..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Select
                  value={sortBy || "default"}
                  onChange={(value) => {
                    setSortBy(
                      value === "default"
                        ? ""
                        : (value as "name" | "productCount" | "createdAt"),
                    );
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "default", label: "Default Order" },
                    { value: "name", label: "Sort by Name" },
                    { value: "productCount", label: "Sort by Popularity" },
                    { value: "createdAt", label: "Sort by Newest" },
                  ]}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {sortBy && (
                <button
                  onClick={() => {
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 rounded-xl border border-border bg-card text-foreground hover:bg-accent/10 transition-all duration-300"
                >
                  {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                </button>
              )}
            </div>
          </div>

          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Found {totalCategories} category
              {totalCategories !== 1 ? "ies" : ""} matching "{searchTerm}"
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-100">
            <div className="text-center">
              <Loader2
                size={48}
                className="animate-spin text-accent mx-auto mb-4"
              />
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !error && (
          <>
            {categories.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No categories found
                </h3>
                <p className="text-muted-foreground">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <>
                {/* Main Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categories.map((category) => (
                    <CategoryCard
                      key={category._id}
                      id={category._id}
                      name={category.name}
                      count={category.count}
                      icon={category.icon}
                      image={category.image}
                      gradient={category.gradient}
                      description={category.description}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/10 transition-all duration-300"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-2">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`min-w-10 h-10 rounded-lg transition-all duration-300 ${
                                currentPage === pageNum
                                  ? "bg-accent text-white"
                                  : "border border-border bg-card text-foreground hover:bg-accent/10"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/10 transition-all duration-300"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Top Categories Section */}
                {topCategories.length > 0 && !searchTerm && (
                  <div className="mt-16">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={24} className="text-accent" />
                        <h2 className="text-2xl font-bold text-foreground">
                          Most Popular Categories
                        </h2>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Based on product count
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topCategories.slice(0, 6).map((category, index) => (
                        <Link
                          key={category._id}
                          href={`/products?category=${category._id}`}
                          className="group"
                        >
                          <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                ) : (
                                  category.icon || "📁"
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                                    {category.name}
                                  </h3>
                                  <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{category.count} products</span>
                                  {category.count > 10 && (
                                    <span className="flex items-center gap-1">
                                      <Award size={12} />
                                      Popular
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features Section */}
                {!searchTerm && (
                  <div className="mt-16 pt-8 border-t border-border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <div className="text-3xl mb-2">⚡</div>
                        <p className="text-sm font-medium text-foreground">
                          Fast Shipping
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Worldwide delivery
                        </p>
                      </div>
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <div className="text-3xl mb-2">🔒</div>
                        <p className="text-sm font-medium text-foreground">
                          Secure Payments
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          100% protected
                        </p>
                      </div>
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <div className="text-3xl mb-2">🔄</div>
                        <p className="text-sm font-medium text-foreground">
                          Easy Returns
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          30-day guarantee
                        </p>
                      </div>
                      <div className="p-4 bg-card rounded-xl border border-border">
                        <div className="text-3xl mb-2">🎁</div>
                        <p className="text-sm font-medium text-foreground">
                          Best Offers
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Daily deals
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
