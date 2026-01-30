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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { toast } from "react-hot-toast";
import { Product, Category } from "@/types";

// Define a WishlistItem interface
interface WishlistItem {
  id: string;
  product: Product;
  addedDate: string;
}

// Mock wishlist data with complete Product structure
const initialWishlistItems: WishlistItem[] = [
  {
    id: "1",
    product: {
      _id: "1",
      slug: "wireless-headphones",
      name: "Premium Wireless Headphones",
      description: "Noise-cancelling over-ear headphones with 30hr battery",
      price: 249.99,
      comparePrice: 299.99,
      averageRating: 4.7,
      reviewCount: 128,
      images: [
        {
          url: "/api/placeholder/400/400",
          publicId: "wireless-headphones-1",
          thumbnail: "/api/placeholder/200/200",
          alt: "Wireless Headphones",
        },
      ],
      category: "Electronics",
      stock: 25,
      isFeatured: true,
      tags: ["Wireless", "Noise Cancelling"],
      brand: "AudioMaster",
      sku: "HP-001-BLK",
      isActive: true,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      specifications: {},
      features: [],
    },
    addedDate: "2024-01-15",
  },
  {
    id: "2",
    product: {
      _id: "2",
      slug: "smart-watch-pro",
      name: "Smart Watch Pro",
      description: "Advanced smartwatch with fitness tracking",
      price: 349.99,
      comparePrice: 399.99,
      averageRating: 4.6,
      reviewCount: 89,
      images: [
        {
          url: "/api/placeholder/400/400",
          publicId: "smart-watch-1",
          thumbnail: "/api/placeholder/200/200",
          alt: "Smart Watch Pro",
        },
      ],
      category: "Electronics",
      stock: 15,
      isFeatured: false,
      tags: ["Smartwatch", "Fitness"],
      brand: "TechWear",
      sku: "SW-002-BLK",
      isActive: true,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10",
      specifications: {},
      features: [],
    },
    addedDate: "2024-01-10",
  },
  {
    id: "3",
    product: {
      _id: "3",
      slug: "laptop-stand-premium",
      name: "Premium Aluminum Laptop Stand",
      description: "Ergonomic aluminum laptop stand",
      price: 89.99,
      comparePrice: 119.99,
      averageRating: 4.5,
      reviewCount: 156,
      images: [
        {
          url: "/api/placeholder/400/400",
          publicId: "laptop-stand-1",
          thumbnail: "/api/placeholder/200/200",
          alt: "Laptop Stand",
        },
      ],
      category: "Electronics",
      stock: 50,
      isFeatured: true,
      tags: ["Ergonomic", "Adjustable"],
      brand: "ErgoTech",
      sku: "LS-003-SIL",
      isActive: true,
      createdAt: "2024-01-05",
      updatedAt: "2024-01-05",
      specifications: {},
      features: [],
    },
    addedDate: "2024-01-05",
  },
  {
    id: "4",
    product: {
      _id: "4",
      slug: "portable-speaker",
      name: "Waterproof Portable Speaker",
      description: "Bluetooth speaker with 360° sound",
      price: 129.99,
      comparePrice: 159.99,
      averageRating: 4.4,
      reviewCount: 203,
      images: [
        {
          url: "/api/placeholder/400/400",
          publicId: "speaker-1",
          thumbnail: "/api/placeholder/200/200",
          alt: "Portable Speaker",
        },
      ],
      category: "Electronics",
      stock: 30,
      isFeatured: false,
      tags: ["Waterproof", "Portable"],
      brand: "SoundWave",
      sku: "SP-004-BLK",
      isActive: true,
      createdAt: "2024-01-02",
      updatedAt: "2024-01-02",
      specifications: {},
      features: [],
    },
    addedDate: "2024-01-02",
  },
  {
    id: "5",
    product: {
      _id: "5",
      slug: "mechanical-keyboard",
      name: "Mechanical Gaming Keyboard",
      description: "RGB mechanical keyboard",
      price: 149.99,
      averageRating: 4.8,
      reviewCount: 67,
      images: [
        {
          url: "/api/placeholder/400/400",
          publicId: "keyboard-1",
          thumbnail: "/api/placeholder/200/200",
          alt: "Mechanical Keyboard",
        },
      ],
      category: "Electronics",
      stock: 20,
      isFeatured: true,
      tags: ["Mechanical", "RGB"],
      brand: "GameMaster",
      sku: "KB-005-BLK",
      isActive: true,
      createdAt: "2023-12-28",
      updatedAt: "2023-12-28",
      specifications: {},
      features: [],
    },
    addedDate: "2023-12-28",
  },
  {
    id: "6",
    product: {
      _id: "6",
      slug: "organic-cotton-t-shirt",
      name: "Organic Cotton T-Shirt",
      description: "Premium organic cotton t-shirt",
      price: 24.99,
      averageRating: 4.2,
      reviewCount: 94,
      images: [
        {
          url: "/api/placeholder/400/400",
          publicId: "tshirt-1",
          thumbnail: "/api/placeholder/200/200",
          alt: "Organic Cotton T-Shirt",
        },
      ],
      category: "Fashion",
      stock: 50,
      isFeatured: true,
      tags: ["Organic", "Cotton"],
      brand: "EcoWear",
      sku: "TS-006-WHT",
      isActive: true,
      createdAt: "2023-12-20",
      updatedAt: "2023-12-20",
      specifications: {},
      features: [],
    },
    addedDate: "2023-12-20",
  },
];

const sortOptions = [
  { value: "date-new", label: "Date Added: Newest" },
  { value: "date-old", label: "Date Added: Oldest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "rating", label: "Highest Rated" },
];

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Sports",
  "Beauty",
];

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>(initialWishlistItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date-new");
  const [filterCategory, setFilterCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get category name
  const getCategoryName = (category: string | Category): string => {
    if (typeof category === "string") {
      return category;
    } else {
      return category.name;
    }
  };

  // Calculate totals
  const totalItems = wishlistItems.length;
  const totalValue = wishlistItems.reduce(
    (sum, item) => sum + item.product.price,
    0,
  );
  const selectedValue = wishlistItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.product.price, 0);

  // Filter items by category
  const filteredItems = wishlistItems.filter(
    (item) =>
      filterCategory === "All" ||
      getCategoryName(item.product.category) === filterCategory,
  );

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "date-new":
        return (
          new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
        );
      case "date-old":
        return (
          new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime()
        );
      case "price-low":
        return a.product.price - b.product.price;
      case "price-high":
        return b.product.price - a.product.price;
      case "name-asc":
        return a.product.name.localeCompare(b.product.name);
      case "name-desc":
        return b.product.name.localeCompare(a.product.name);
      case "rating":
        return (b.product.averageRating || 0) - (a.product.averageRating || 0);
      default:
        return 0;
    }
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    toast.success("Item removed from wishlist");
  };

  const handleRemoveSelected = () => {
    setWishlistItems((prev) =>
      prev.filter((item) => !selectedItems.includes(item.id)),
    );
    setSelectedItems([]);
    toast.success("Selected items removed from wishlist");
  };

  const handleAddSelectedToCart = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real app, add items to cart using your cart store
      // selectedItems.forEach(itemId => {
      //   const item = wishlistItems.find(w => w.id === itemId);
      //   if (item) {
      //     cart.addItem({
      //       product: item.product,
      //       quantity: 1,
      //       price: item.product.price,
      //     });
      //   }
      // });

      toast.success(`${selectedItems.length} items added to cart`);
      // Optionally remove from wishlist after adding to cart
      // handleRemoveSelected();
    } catch (error) {
      toast.error("Failed to add items to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWishlist = () => {
    const shareUrl = `${window.location.origin}/wishlist/share/your-share-id`; // In real app, generate share link
    navigator.clipboard.writeText(shareUrl);
    toast.success("Wishlist link copied to clipboard!");
  };

  const handleClearWishlist = () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      setWishlistItems([]);
      setSelectedItems([]);
      toast.success("Wishlist cleared");
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-gray-400" size={48} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Your wishlist is empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Save items you love for later. Click the heart icon on any product
            to add it here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="gap-2">
                <ChevronLeft size={16} />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="outline">Browse Categories</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link
              href="/"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Home
            </Link>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-gray-900 dark:text-white">Wishlist</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                My Wishlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Save items you love and come back to them later
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 min-w-[140px]">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalItems}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Items
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 min-w-[140px]">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalValue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 md:p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Selection Controls */}
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
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select All ({filteredItems.length})
                      </span>
                    </div>

                    {selectedItems.length > 0 && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedItems.length} selected
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* View & Sort Controls */}
                <div className="flex items-center gap-4">
                  {/* Category Filter */}
                  <div className="hidden md:flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
                    >
                      <List size={18} />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <SortAsc
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
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

              {/* Selected Items Actions */}
              {selectedItems.length > 0 && (
                <div className="mt-6 pt-6 border-t dark:border-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedItems.length} items selected
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Total:{" "}
                        <span className="font-bold">
                          ${selectedValue.toFixed(2)}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleAddSelectedToCart}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                        className="gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-200 dark:border-red-800"
                      >
                        <Trash2 size={16} />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Items */}
            {viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedItems.map((item) => (
                  <div key={item.id} className="relative group">
                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>

                    <ProductCard product={item.product} />

                    {/* Added Date */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Added{" "}
                      {new Date(item.addedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {sortedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden group"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Selection Checkbox */}
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-1"
                          />
                        </div>

                        {/* Product Image */}
                        <div className="md:w-48 flex-shrink-0">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900">
                              <span className="text-5xl">🛒</span>
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Link
                                  href={`/categories/${getCategoryName(item.product.category).toLowerCase()}`}
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {getCategoryName(item.product.category)}
                                </Link>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Added{" "}
                                  {new Date(item.addedDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </span>
                              </div>

                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  className="hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>

                              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {item.product.description}
                              </p>

                              {/* Tags */}
                              {item.product.tags &&
                                item.product.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {item.product.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>

                            {/* Price & Actions */}
                            <div className="flex-shrink-0">
                              <div className="text-right mb-4">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                  ${item.product.price.toFixed(2)}
                                </div>
                                {item.product.comparePrice && (
                                  <div className="text-lg line-through text-gray-400 dark:text-gray-600">
                                    ${item.product.comparePrice.toFixed(2)}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <Link href={`/products/${item.product.slug}`}>
                                  <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                  >
                                    <Eye size={16} />
                                    View Details
                                  </Button>
                                </Link>
                                <Button className="w-full gap-2">
                                  <ShoppingBag size={16} />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="md:self-start text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {sortedItems.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                <div className="h-20 w-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  No items found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  No wishlist items match your current filters. Try a different
                  category.
                </p>
                <Button
                  onClick={() => setFilterCategory("All")}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              {/* Wishlist Actions */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Wishlist Actions
                </h2>

                <div className="space-y-4">
                  <Button
                    onClick={handleShareWishlist}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <Share2 size={18} />
                    Share Wishlist
                  </Button>

                  <Link href="/">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                    >
                      <ChevronLeft size={18} />
                      Continue Shopping
                    </Button>
                  </Link>

                  <Button
                    onClick={handleClearWishlist}
                    variant="outline"
                    className="w-full justify-start gap-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-200 dark:border-red-800"
                  >
                    <Trash2 size={18} />
                    Clear Wishlist
                  </Button>
                </div>
              </div>

              {/* Price Alert */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Get Price Alerts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  We'll notify you when items in your wishlist go on sale
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400">
                        🔔
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Email Alerts
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        When prices drop
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400">
                        📱
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Push Notifications
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        On your devices
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6">Enable Alerts</Button>
              </div>

              {/* Recently Viewed */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Recently Viewed
                </h3>
                <div className="space-y-4">
                  {initialWishlistItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.product.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🛒</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          {item.product.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ${item.product.price.toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/recently-viewed"
                  className="inline-block w-full text-center mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View All
                </Link>
              </div>

              {/* Wishlist Tips */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Wishlist Tips
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Items may go out of stock quickly
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Prices are updated daily
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Share your wishlist for gift ideas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 mt-2"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Get notified when items go on sale
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Based on Your Wishlist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {initialWishlistItems.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item.product} />
            ))}
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Share Your Wishlist
              </h2>
              <p className="text-blue-100 mb-6">
                Let friends and family know what you're interested in. Perfect
                for birthdays, holidays, or just because!
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleShareWishlist}
                  className="bg-white text-blue-700 hover:bg-blue-50 gap-3"
                >
                  <Share2 size={18} />
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
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 w-12 rounded-full border-2 border-blue-600 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                >
                  <span className="text-white font-bold">U{i}</span>
                </div>
              ))}
              <div className="h-12 w-12 rounded-full border-2 border-blue-600 bg-blue-800 flex items-center justify-center">
                <span className="text-white font-bold">+12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
