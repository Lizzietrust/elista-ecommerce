"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Share2,
  ChevronLeft,
  Eye,
  AlertCircle,
  ShoppingCart,
  Filter,
  SortAsc,
  Grid,
  List,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { toast } from "react-hot-toast";
import {
  useWishlist,
  useClearWishlist,
  useRemoveFromWishlist,
  useMoveToCart,
  useGenerateShareLink,
} from "@/lib/hooks/use-wishlist";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import type { ProductCategory } from "@/types";
import type { WishlistResponse, WishlistItem } from "@/lib/api/wishlist";

const sortOptions = [
  { value: "-addedAt", label: "Date Added: Newest" },
  { value: "addedAt", label: "Date Added: Oldest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "rating", label: "Highest Rated" },
];

const getCategoryName = (
  category: string | ProductCategory | undefined,
): string => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  if (typeof category === "object" && category.name) return category.name;
  return "Uncategorized";
};

interface WishlistData {
  items: WishlistItem[];
  summary: {
    totalItems: number;
    totalEstimatedCost: number;
    inStockCount: number;
    outOfStockCount: number;
    averageRating: number;
  };
  wishlist: {
    _id: string;
    name: string;
    itemCount: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export default function WishlistPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("-addedAt");
  const [filterCategory, setFilterCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: wishlistData, isLoading, isError, refetch } = useWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } =
    useRemoveFromWishlist();
  const { mutate: clearWishlist, isPending: isClearing } = useClearWishlist();
  const { mutate: moveToCart, isPending: isMovingToCart } = useMoveToCart();
  const { mutate: generateShareLink, isPending: isGeneratingShareLink } =
    useGenerateShareLink();

  const data = wishlistData as WishlistData | undefined;

  const items = data?.items || [];
  const summary = data?.summary;
  const wishlistInfo = data?.wishlist;

  const categories = [
    "All",
    ...new Set(
      items.map((item: WishlistItem) => getCategoryName(item.product.category)),
    ),
  ].filter(Boolean);

  const filteredItems = items.filter(
    (item: WishlistItem) =>
      filterCategory === "All" ||
      getCategoryName(item.product.category) === filterCategory,
  );

  const sortedItems = [...filteredItems].sort(
    (a: WishlistItem, b: WishlistItem) => {
      switch (sortBy) {
        case "-addedAt":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "addedAt":
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case "price-asc":
          return a.product.price - b.product.price;
        case "price-desc":
          return b.product.price - a.product.price;
        case "name-asc":
          return a.product.name.localeCompare(b.product.name);
        case "name-desc":
          return b.product.name.localeCompare(a.product.name);
        case "rating":
          return (
            (b.product.averageRating || 0) - (a.product.averageRating || 0)
          );
        default:
          return 0;
      }
    },
  );

  const totalItems = items.length;
  const totalValue = items.reduce(
    (sum: number, item: WishlistItem) => sum + item.product.price,
    0,
  );
  const selectedValue = items
    .filter((item: WishlistItem) => selectedItems.includes(item.product._id))
    .reduce((sum: number, item: WishlistItem) => sum + item.product.price, 0);

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        filteredItems.map((item: WishlistItem) => item.product._id),
      );
    }
  };

  const handleSelectItem = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleRemoveItem = (productId: string) => {
    removeFromWishlist(productId, {
      onSuccess: () => {
        setSelectedItems((prev) => prev.filter((id) => id !== productId));
        refetch();
      },
    });
  };

  const handleRemoveSelected = () => {
    const promises = selectedItems.map((productId) => {
      return new Promise((resolve) => {
        removeFromWishlist(productId, {
          onSuccess: resolve,
          onError: resolve,
        });
      });
    });

    Promise.all(promises).then(() => {
      setSelectedItems([]);
      refetch();
    });
  };

  const handleAddSelectedToCart = async () => {
    const promises = selectedItems.map((productId) => {
      return new Promise((resolve) => {
        moveToCart(
          { productId },
          {
            onSuccess: resolve,
            onError: resolve,
          },
        );
      });
    });

    await Promise.all(promises);
    setSelectedItems([]);
    refetch();
  };

  const handleShareWishlist = () => {
    generateShareLink(7, {
      onSuccess: (response) => {
        const shareUrl = response.data?.shareUrl;
        if (shareUrl) {
          navigator.clipboard.writeText(shareUrl);
          toast.success("Wishlist link copied to clipboard!");
        }
      },
    });
  };

  const handleClearWishlist = () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      clearWishlist(undefined, {
        onSuccess: () => {
          setSelectedItems([]);
          refetch();
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/4">
              <Skeleton className="h-16 w-full mb-6 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="lg:w-1/4">
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-lg p-8">
            <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
            <p className="text-destructive font-semibold mb-2">
              Failed to load wishlist
            </p>
            <p className="text-foreground-muted text-sm mb-4">
              There was an error loading your wishlist. Please try again.
            </p>
            <Button onClick={() => refetch()} className="gap-2">
              <RefreshCw size={16} />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !isError && items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-24 w-24 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-foreground-muted" size={48} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Your wishlist is empty
          </h1>
          <p className="text-foreground-muted mb-8">
            Save items you love for later. Click the heart icon on any product
            to add it here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="gap-2 bg-primary hover:bg-primary-light">
                <ChevronLeft size={16} />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/categories">
              <Button
                variant="outline"
                className="border-border hover:bg-background-secondary"
              >
                Browse Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-foreground">Wishlist</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                My Wishlist
              </h1>
              <p className="text-foreground-muted mt-2">
                {items.length} {items.length === 1 ? "item" : "items"} saved
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-background-secondary rounded-xl p-4 min-w-35 border border-border">
                <div className="text-2xl font-bold text-foreground">
                  {summary?.totalItems || totalItems}
                </div>
                <div className="text-sm text-foreground-muted">Total Items</div>
              </div>
              <div className="bg-background-secondary rounded-xl p-4 min-w-35 border border-border">
                <div className="text-2xl font-bold text-foreground">
                  ${(summary?.totalEstimatedCost || totalValue).toFixed(2)}
                </div>
                <div className="text-sm text-foreground-muted">Total Value</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <div className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-border">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.length === filteredItems.length &&
                          filteredItems.length > 0
                        }
                        onChange={handleSelectAll}
                        className="h-5 w-5 text-accent rounded border-border focus:ring-accent"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Select All ({filteredItems.length})
                      </span>
                    </div>

                    {selectedItems.length > 0 && (
                      <>
                        <span className="text-border">|</span>
                        <span className="text-sm text-foreground-muted">
                          {selectedItems.length} selected
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {categories.length > 2 && (
                    <div className="hidden md:flex items-center gap-2">
                      <Filter size={16} className="text-foreground-muted" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-transparent text-sm text-foreground focus:outline-none"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-background-secondary p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "grid"
                          ? "bg-white dark:bg-gray-700 text-foreground shadow-sm"
                          : "text-foreground-muted hover:text-accent"
                      }`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${
                        viewMode === "list"
                          ? "bg-white dark:bg-gray-700 text-foreground shadow-sm"
                          : "text-foreground-muted hover:text-accent"
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>

                  <div className="relative">
                    <SortAsc
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-10 pr-8 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent appearance-none text-sm"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-foreground">
                        {selectedItems.length} items selected
                      </span>
                      <span className="text-foreground-muted">
                        Total:{" "}
                        <span className="font-bold text-accent">
                          ${selectedValue.toFixed(2)}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleAddSelectedToCart}
                        disabled={isMovingToCart}
                        className="gap-2 bg-primary hover:bg-primary-light"
                      >
                        {isMovingToCart ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            Add to Cart ({selectedItems.length})
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleRemoveSelected}
                        variant="outline"
                        disabled={isRemoving}
                        className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {sortedItems.length === 0 ? (
              <div className="text-center py-16 bg-background-secondary/50 backdrop-blur-sm rounded-2xl border border-border">
                <div className="h-20 w-20 bg-background-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-foreground-muted" size={32} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  No items found
                </h3>
                <p className="text-foreground-muted mb-8 max-w-md mx-auto">
                  No wishlist items match your current filters. Try a different
                  category.
                </p>
                <Button
                  onClick={() => setFilterCategory("All")}
                  variant="outline"
                  className="border-border hover:bg-background-secondary"
                >
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedItems.map((item: WishlistItem) => (
                  <div key={item.product._id} className="relative group">
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.product._id)}
                        onChange={() => handleSelectItem(item.product._id)}
                        className="h-5 w-5 text-accent rounded border-border focus:ring-accent bg-background"
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      disabled={isRemoving}
                      className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>

                    <ProductCard product={item.product} />

                    <div className="text-xs text-foreground-muted mt-2 text-center">
                      Added{" "}
                      {new Date(item.addedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedItems.map((item: WishlistItem) => (
                  <div
                    key={item.product._id}
                    className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden group border border-border"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.product._id)}
                            onChange={() => handleSelectItem(item.product._id)}
                            className="h-5 w-5 text-accent rounded border-border focus:ring-accent mt-1"
                          />
                        </div>

                        <div className="md:w-48 shrink-0">
                          <div className="aspect-square bg-background-tertiary rounded-xl overflow-hidden">
                            {item.product.images &&
                            item.product.images.length > 0 ? (
                              <img
                                src={
                                  typeof item.product.images[0] === "string"
                                    ? item.product.images[0]
                                    : item.product.images[0].url
                                }
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <span className="text-5xl">🛒</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Link
                                  href={`/categories/${getCategoryName(item.product.category).toLowerCase()}`}
                                  className="text-sm text-accent hover:underline"
                                >
                                  {getCategoryName(item.product.category)}
                                </Link>
                                <span className="text-xs text-foreground-muted">
                                  Added{" "}
                                  {new Date(item.addedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </span>
                              </div>

                              <h3 className="text-xl font-bold text-foreground mb-2">
                                <Link
                                  href={`/products/${item.product._id}`}
                                  className="hover:text-accent transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>

                              <p className="text-foreground-muted mb-4 line-clamp-2">
                                {item.product.description}
                              </p>

                              {/* Features section - using features instead of tags */}
                              {item.product.features &&
                                item.product.features.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {item.product.features
                                      .slice(0, 3)
                                      .map((feature: string, index: number) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 bg-background-tertiary text-foreground-muted text-xs rounded-full"
                                        >
                                          {feature}
                                        </span>
                                      ))}
                                  </div>
                                )}
                            </div>

                            <div className="shrink-0">
                              <div className="text-right mb-4">
                                <div className="text-2xl font-bold text-foreground">
                                  ${item.product.price.toFixed(2)}
                                </div>
                                {item.product.comparePrice && (
                                  <div className="text-lg line-through text-foreground-muted">
                                    ${item.product.comparePrice.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <Link href={`/products/${item.product._id}`}>
                                  <Button
                                    variant="outline"
                                    className="w-full gap-2 border-border hover:bg-background-secondary"
                                  >
                                    <Eye size={16} />
                                    View Details
                                  </Button>
                                </Link>
                                <Button
                                  onClick={() => {
                                    moveToCart(
                                      { productId: item.product._id },
                                      {
                                        onSuccess: () => refetch(),
                                      },
                                    );
                                  }}
                                  disabled={isMovingToCart}
                                  className="w-full gap-2 bg-primary hover:bg-primary-light"
                                >
                                  <ShoppingBag size={16} />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={isRemoving}
                          className="md:self-start text-foreground-muted hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-border">
                <h2 className="text-xl font-bold text-foreground mb-6">
                  Wishlist Actions
                </h2>

                <div className="space-y-4">
                  <Button
                    onClick={handleShareWishlist}
                    disabled={isGeneratingShareLink || items.length === 0}
                    variant="outline"
                    className="w-full justify-start gap-3 border-border hover:bg-background-secondary"
                  >
                    {isGeneratingShareLink ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Share2 size={18} className="text-accent" />
                    )}
                    Share Wishlist
                  </Button>

                  <Link href="/">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-border hover:bg-background-secondary"
                    >
                      <ChevronLeft size={18} />
                      Continue Shopping
                    </Button>
                  </Link>

                  <Button
                    onClick={handleClearWishlist}
                    disabled={isClearing || items.length === 0}
                    variant="outline"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    {isClearing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    Clear Wishlist
                  </Button>
                </div>
              </div>

              <div className="bg-linear-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
                <h3 className="font-bold text-foreground mb-4">
                  Get Price Alerts
                </h3>
                <p className="text-sm text-foreground-muted mb-4">
                  We'll notify you when items in your wishlist go on sale
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary">🔔</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        Email Alerts
                      </div>
                      <div className="text-sm text-foreground-muted">
                        When prices drop
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent">📱</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        Push Notifications
                      </div>
                      <div className="text-sm text-foreground-muted">
                        On your devices
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-primary hover:bg-primary-light">
                  Enable Alerts
                </Button>
              </div>

              <div className="bg-linear-to-r from-accent/10 to-secondary/10 rounded-2xl p-6 border border-accent/20">
                <h3 className="font-bold text-foreground mb-4">
                  Wishlist Tips
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                    <span className="text-sm text-foreground-muted">
                      Items may go out of stock quickly
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                    <span className="text-sm text-foreground-muted">
                      Prices are updated daily
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                    <span className="text-sm text-foreground-muted">
                      Share your wishlist for gift ideas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                    <span className="text-sm text-foreground-muted">
                      Get notified when items go on sale
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Based on Your Wishlist
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.slice(0, 4).map((item: WishlistItem) => (
                <ProductCard key={item.product._id} product={item.product} />
              ))}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-12 bg-linear-to-r from-primary to-primary-light text-white rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-lg">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Share Your Wishlist
                </h2>
                <p className="text-white/80 mb-6">
                  Let friends and family know what you're interested in. Perfect
                  for birthdays, holidays, or just because!
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleShareWishlist}
                    disabled={isGeneratingShareLink}
                    className="bg-white text-primary hover:bg-white/90 gap-3"
                  >
                    {isGeneratingShareLink ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Share2 size={18} />
                    )}
                    Copy Share Link
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-white/10 gap-3"
                  >
                    <span>📧</span>
                    Email Wishlist
                  </Button>
                </div>
              </div>

              <div className="flex -space-x-4">
                {items.slice(0, 5).map((item: WishlistItem, i: number) => (
                  <div
                    key={item.product._id}
                    className="h-12 w-12 rounded-full border-2 border-primary-light bg-linear-to-br from-primary to-accent flex items-center justify-center"
                  >
                    <span className="text-white font-bold text-xs">
                      {item.product.name.charAt(0)}
                    </span>
                  </div>
                ))}
                {items.length > 5 && (
                  <div className="h-12 w-12 rounded-full border-2 border-primary-light bg-primary flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      +{items.length - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
