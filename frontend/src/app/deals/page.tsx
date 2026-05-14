"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  Flame,
  Clock,
  Zap,
  Percent,
  Tag,
  Filter,
  ChevronDown,
  TrendingDown,
} from "lucide-react";
import { useProducts } from "@/lib/hooks/use-products";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/lib/api/products";

type DealType = "all" | "flash" | "clearance" | "seasonal" | "bogo";
type SortOption = "discount" | "price-asc" | "price-desc" | "ending-soon";

interface DealProduct extends Product {
  dealType?: DealType;
  endsAt?: Date;
}

export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDealType, setSelectedDealType] = useState<DealType>("all");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("discount");
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: products,
    isLoading,
    error,
  } = useProducts({
    params: {
      search: searchTerm,
      sort: sortBy,
      limit: 24,
    },
  });

  const filteredProducts = (products?.data as DealProduct[])?.filter(
    (product: DealProduct) => {
      if (selectedDealType !== "all" && product.dealType !== selectedDealType) {
        return false;
      }

      if (product.discountPercentage < minDiscount) {
        return false;
      }
      return true;
    },
  );

  const stats = {
    totalDeals: filteredProducts?.length || 0,
    avgDiscount: calculateAverageDiscount(filteredProducts),
    biggestDiscount: findBiggestDiscount(filteredProducts),
    flashSalesCount:
      filteredProducts?.filter((p: DealProduct) => p.dealType === "flash")
        .length || 0,
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block">
            <p>Failed to load deals. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full mb-4">
            <Flame size={16} />
            <span className="text-sm font-medium">Limited Time Offers</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Hot Deals & Discounts
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Save big on your favorite items. Limited quantities available!
          </p>

          {/* Stats Cards */}
          {!isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-2xl font-bold text-accent">
                  {stats.totalDeals}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Deals
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-2xl font-bold text-accent">
                  {stats.avgDiscount}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Avg. Discount
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-2xl font-bold text-accent">
                  Up to {stats.biggestDiscount}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Biggest Deal
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-2xl font-bold text-accent">
                  {stats.flashSalesCount}
                </div>
                <div className="text-sm text-muted-foreground">Flash Sales</div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search deals..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 rounded-xl border border-border bg-card text-foreground hover:bg-accent/10 transition-all duration-300 flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
              <ChevronDown
                className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
                size={16}
              />
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
            >
              <option value="discount">Biggest Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-card rounded-xl border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Deal Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Deal Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "all",
                        "flash",
                        "clearance",
                        "seasonal",
                        "bogo",
                      ] as DealType[]
                    ).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedDealType(type)}
                        className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                          selectedDealType === type
                            ? "bg-accent text-white"
                            : "bg-muted text-muted-foreground hover:bg-accent/10"
                        }`}
                      >
                        {type === "all" ? "All Deals" : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount Range Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Discount
                  </label>
                  <div className="flex gap-2">
                    {[0, 10, 20, 30, 40, 50].map((discount) => (
                      <button
                        key={discount}
                        onClick={() => setMinDiscount(discount)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          minDiscount === discount
                            ? "bg-accent text-white"
                            : "bg-muted text-muted-foreground hover:bg-accent/10"
                        }`}
                      >
                        {discount}%+
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-100">
            <Loader2 size={48} className="animate-spin text-accent" />
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <>
            {filteredProducts?.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏷️</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No deals found
                </h3>
                <p className="text-muted-foreground">
                  Check back soon for new discounts!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts?.map((product: DealProduct) => (
                    <div key={product._id} className="relative">
                      {/* Deal Badge */}
                      {product.discountPercentage > 30 && (
                        <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                          HOT DEAL
                        </div>
                      )}
                      {/* Countdown Timer for Flash Sales */}
                      {product.dealType === "flash" && product.endsAt && (
                        <CountdownTimer endDate={product.endsAt} />
                      )}
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Newsletter Signup for Deal Alerts */}
                <div className="mt-16 bg-linear-to-r from-accent/20 to-accent/5 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    Never Miss a Deal!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Subscribe to get exclusive deals and early access to flash
                    sales
                  </p>
                  <div className="flex max-w-md mx-auto gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-card"
                    />
                    <button className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return null;

  return (
    <div className="absolute top-2 right-2 z-20 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-mono">
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
}

function calculateTimeLeft(endDate: Date) {
  const difference = new Date(endDate).getTime() - new Date().getTime();
  if (difference <= 0) return null;

  return {
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function calculateAverageDiscount(products?: DealProduct[]) {
  if (!products?.length) return 0;
  const total = products.reduce(
    (sum: number, p: DealProduct) => sum + p.discountPercentage,
    0,
  );
  return Math.round(total / products.length);
}

function findBiggestDiscount(products?: DealProduct[]) {
  if (!products?.length) return 0;
  return Math.max(...products.map((p: DealProduct) => p.discountPercentage));
}
