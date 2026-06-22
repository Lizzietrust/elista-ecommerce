"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Check,
  ChevronLeft,
  Package,
  Clock,
  Award,
  Minus,
  Plus,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Store,
  Ruler,
  Weight,
  Tag,
  ThumbsUp,
  Eye,
  Calendar,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { useProductById } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCheckInWishlist,
  useToggleWishlist,
} from "@/lib/hooks/use-wishlist";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { WishlistItem } from "@/lib/api/wishlist";
import type { ProductCategory } from "@/types";

interface ProductDetailsProps {
  productId: string;
}

interface CheckInWishlistResponse {
  isInWishlist: boolean;
  itemDetails?: WishlistItem;
}

const getCategoryName = (
  category: string | ProductCategory | undefined,
): string => {
  if (!category) return "Products";
  if (typeof category === "string") return category;
  if (typeof category === "object" && category.name) return category.name;
  return "Products";
};

const getCategorySlug = (
  category: string | ProductCategory | undefined,
): string => {
  if (!category) return "products";
  if (typeof category === "object" && category.slug) return category.slug;
  if (typeof category === "string")
    return category.toLowerCase().replace(/\s+/g, "-");
  return "products";
};

export function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");

  const { data, isLoading, error } = useProductById(productId, {});

  const isAuthenticated =
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false;

  const { data: wishlistData, isLoading: isCheckingWishlist } =
    useCheckInWishlist(productId, {
      enabled: isAuthenticated && !!productId,
    });

  const wishlistCheckData = wishlistData as CheckInWishlistResponse | undefined;
  const isInWishlist = wishlistCheckData?.isInWishlist ?? false;

  const { mutate: toggleWishlist, isPending: isTogglingWishlist } =
    useToggleWishlist();

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !data?.product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-background-secondary rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-destructive mb-4 font-semibold">
            Failed to load product
          </p>
          <p className="text-sm text-foreground-muted mb-6">{error?.message}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-light text-primary-foreground"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const product = data.product;
  const relatedProducts = data.relatedProducts || [];

  const discountPercentage = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log("Add to cart:", {
      productId: product._id,
      quantity,
      color: selectedColor,
      size: selectedSize,
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please login to manage your wishlist", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    if (!productId) {
      toast.error("Invalid product");
      return;
    }

    toggleWishlist(
      {
        product,
        isInWishlist,
      },
      {
        onSuccess: (data) => {
          if (data?.action === "added") {
            toast.success("Added to wishlist! ❤️", {
              duration: 2000,
              position: "bottom-center",
            });
          } else if (data?.action === "removed") {
            toast.success("Removed from wishlist", {
              duration: 2000,
              position: "bottom-center",
            });
          }
        },
        onError: (error: any) => {
          console.error("Toggle wishlist error:", error);
          toast.error(error?.message || "Failed to update wishlist", {
            duration: 3000,
            position: "bottom-center",
          });
        },
      },
    );
  };

  const isLoadingWishlist = isCheckingWishlist || isTogglingWishlist;

  const categoryName = getCategoryName(product.category);
  const categorySlug = getCategorySlug(product.category);

  const reviewCount = product.reviewCount || product.ratingsCount || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-background-secondary/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm flex-wrap">
            <Link
              href="/"
              className="text-foreground-muted hover:text-accent transition-colors duration-300"
            >
              Home
            </Link>
            <ChevronLeft
              size={14}
              className="rotate-180 text-foreground-muted"
            />
            <Link
              href="/categories"
              className="text-foreground-muted hover:text-accent transition-colors duration-300"
            >
              Categories
            </Link>
            <ChevronLeft
              size={14}
              className="rotate-180 text-foreground-muted"
            />
            <Link
              href={`/categories/${categorySlug}`}
              className="text-foreground-muted hover:text-accent transition-colors duration-300"
            >
              {categoryName}
            </Link>
            <ChevronLeft
              size={14}
              className="rotate-180 text-foreground-muted"
            />
            <span className="text-foreground font-semibold truncate max-w-50">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column - Product Images */}
          <div className="lg:w-1/2">
            {/* Main Image */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-4 border border-border hover:shadow-2xl transition-all duration-500 group">
              <div className="aspect-square rounded-xl bg-background-secondary flex items-center justify-center overflow-hidden relative">
                {product.images && product.images[selectedImage] ? (
                  <Image
                    src={
                      typeof product.images[selectedImage] === "string"
                        ? product.images[selectedImage]
                        : product.images[selectedImage].url
                    }
                    alt={
                      typeof product.images[selectedImage] === "object"
                        ? product.images[selectedImage].alt || product.name
                        : product.name
                    }
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="text-8xl animate-bounce">🪑</div>
                )}
                {discountPercentage > 0 && (
                  <div className="absolute top-4 right-4 bg-linear-to-r from-destructive to-accent text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg z-10">
                    -{discountPercentage}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
                {product.images.map((image, index) => {
                  const imageUrl =
                    typeof image === "string" ? image : image.url;
                  const imageAlt =
                    typeof image === "object"
                      ? image.alt || product.name
                      : product.name;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`shrink-0 w-20 h-20 rounded-xl bg-white dark:bg-gray-800 border-2 overflow-hidden transition-all duration-300 ${
                        selectedImage === index
                          ? "border-accent shadow-lg scale-105"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      <div className="w-full h-full relative">
                        <Image
                          src={imageUrl}
                          alt={imageAlt}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-background-secondary/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-border hover:shadow-lg transition-all duration-300 group">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="text-success" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    Free Shipping
                  </div>
                  <div className="text-xs text-foreground-muted">
                    On orders over $50
                  </div>
                </div>
              </div>

              <div className="bg-background-secondary/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-border hover:shadow-lg transition-all duration-300 group">
                <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="text-info" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    2-Year Warranty
                  </div>
                  <div className="text-xs text-foreground-muted">
                    Full protection
                  </div>
                </div>
              </div>

              <div className="bg-background-secondary/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-border hover:shadow-lg transition-all duration-300 group">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RefreshCw className="text-warning" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    30-Day Returns
                  </div>
                  <div className="text-xs text-foreground-muted">
                    Easy & hassle-free
                  </div>
                </div>
              </div>

              <div className="bg-background-secondary/50 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-border hover:shadow-lg transition-all duration-300 group">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="text-accent" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    Premium Quality
                  </div>
                  <div className="text-xs text-foreground-muted">
                    Verified & trusted
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:w-1/2">
            <div className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-border">
              {/* Product Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Link
                    href={`/categories/${categorySlug}`}
                    className="text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <Tag size={14} />
                    {categoryName}
                  </Link>
                  {product.brand && (
                    <>
                      <span className="text-border">•</span>
                      <span className="text-sm text-foreground-muted">
                        Brand:{" "}
                        <span className="font-semibold text-foreground">
                          {product.brand}
                        </span>
                      </span>
                    </>
                  )}
                  {product.isFeatured && (
                    <>
                      <span className="text-border">•</span>
                      <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full inline-flex items-center gap-1">
                        <Sparkles size={12} />
                        Featured
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-earth mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={
                            i <
                            Math.floor(
                              product.averageRating || product.rating || 0,
                            )
                              ? "currentColor"
                              : "none"
                          }
                          className="transition-all"
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {(product.averageRating || product.rating || 0).toFixed(
                        1,
                      )}
                    </span>
                  </div>
                  <span className="text-foreground-muted">
                    ({reviewCount} reviews)
                  </span>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      product.stock > 10
                        ? "bg-success/10 text-success"
                        : product.stock > 0
                          ? "bg-accent/10 text-accent"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.stock > 10
                          ? "bg-success"
                          : product.stock > 0
                            ? "bg-accent"
                            : "bg-destructive"
                      } animate-pulse`}
                    />
                    {product.stock > 10
                      ? "In Stock"
                      : product.stock > 0
                        ? `Only ${product.stock} left`
                        : "Out of Stock"}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-gradient-warm rounded-xl">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.comparePrice && (
                    <>
                      <span className="text-xl line-through text-foreground-muted">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                      <span className="px-2 py-1 bg-linear-to-r from-destructive to-accent text-white text-sm font-bold rounded-full shadow-md">
                        Save $
                        {(product.comparePrice - product.price).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-foreground-muted">
                  or 4 interest-free payments of $
                  {(product.price / 4).toFixed(2)} with
                  <span className="font-semibold ml-1 text-accent">
                    Elista Pay
                  </span>
                </p>
              </div>

              {/* Short Description */}
              <div className="mb-8 p-4 bg-background-tertiary/30 rounded-xl">
                <p className="text-foreground-muted leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    Select Color
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 ${
                          selectedColor === color
                            ? "border-accent bg-accent/10 text-accent font-semibold shadow-md"
                            : "border-border hover:border-accent hover:bg-accent/5"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-foreground">
                      Select Size
                    </h3>
                    <button className="text-sm text-accent hover:underline inline-flex items-center gap-1">
                      <Ruler size={14} />
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 font-semibold ${
                          selectedSize === size
                            ? "border-accent bg-accent/10 text-accent shadow-md"
                            : "border-border hover:border-accent"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border-2 border-border rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="h-12 w-12 flex items-center justify-center text-foreground-muted hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="h-12 w-16 flex items-center justify-center font-bold text-foreground">
                      {quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="h-12 w-12 flex items-center justify-center text-foreground-muted hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 py-3 text-lg gap-3 bg-primary hover:bg-primary-light text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <ShoppingCart size={20} />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Button>

                  {/* Wishlist Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleWishlist}
                    disabled={isLoadingWishlist || !isAuthenticated}
                    className="h-12 w-12 border-2 border-border hover:border-accent hover:bg-accent/5 transition-all duration-300 group relative"
                    aria-label={
                      isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    {isLoadingWishlist ? (
                      <Loader2 size={20} className="animate-spin text-accent" />
                    ) : (
                      <Heart
                        size={20}
                        className={`transition-all duration-300 ${
                          isInWishlist
                            ? "fill-destructive text-destructive scale-110"
                            : "text-foreground-muted group-hover:text-accent group-hover:scale-110"
                        }`}
                        fill={isInWishlist ? "currentColor" : "none"}
                      />
                    )}
                  </Button>
                </div>

                {/* Show login message if not authenticated */}
                {!isAuthenticated && (
                  <div className="mt-4 p-3 bg-warning/10 rounded-xl border border-warning/20">
                    <p className="text-sm text-warning">
                      <Link
                        href="/login"
                        className="font-semibold underline hover:no-underline"
                      >
                        Sign in
                      </Link>{" "}
                      to add items to your wishlist
                    </p>
                  </div>
                )}

                {product.stock < 10 && product.stock > 0 && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-xl border border-accent/20">
                    <div className="flex items-center gap-2 text-accent">
                      <Clock size={16} className="animate-pulse" />
                      <span className="font-semibold text-sm">
                        Hurry! Only {product.stock} left in stock
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-2 border-border hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
                >
                  <Share2
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Share
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-2 border-border hover:border-accent hover:bg-accent/5 transition-all duration-300 group"
                >
                  <MessageCircle
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Ask Question
                </Button>
              </div>

              {/* Product Features */}
              <div className="space-y-3 pt-4 border-t-2 border-border">
                <div className="flex items-center gap-3 text-foreground-muted group">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Check className="text-success" size={16} />
                  </div>
                  <span className="text-sm">
                    Free shipping on orders over $50
                  </span>
                </div>
                <div className="flex items-center gap-3 text-foreground-muted group">
                  <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <RefreshCw className="text-info" size={16} />
                  </div>
                  <span className="text-sm">30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-foreground-muted group">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="text-accent" size={16} />
                  </div>
                  <span className="text-sm">2-year manufacturer warranty</span>
                </div>
                <div className="flex items-center gap-3 text-foreground-muted group">
                  <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="text-warning" size={16} />
                  </div>
                  <span className="text-sm">24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border">
            <div className="border-b border-border">
              <div className="flex overflow-x-auto">
                {[
                  {
                    id: "description",
                    label: "Description",
                    icon: <Package size={18} />,
                  },
                  {
                    id: "specifications",
                    label: "Specifications",
                    icon: <Ruler size={18} />,
                  },
                  {
                    id: "features",
                    label: "Features & Benefits",
                    icon: <Sparkles size={18} />,
                  },
                  { id: "reviews", label: "Reviews", icon: <Star size={18} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-all duration-300 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-accent text-accent bg-accent/5"
                        : "border-transparent text-foreground-muted hover:text-foreground hover:border-border"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Description Tab */}
              {activeTab === "description" && (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold text-gradient-earth mb-6">
                    Product Description
                  </h2>
                  <div className="text-foreground-muted whitespace-pre-line leading-relaxed">
                    {product.longDescription || product.description}
                  </div>
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === "specifications" &&
                product.specifications &&
                Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gradient-earth mb-6">
                      Technical Specifications
                    </h2>
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {Object.entries(product.specifications).map(
                            ([key, value], index) => (
                              <tr
                                key={key}
                                className={
                                  index % 2 === 0
                                    ? "bg-background-tertiary/30"
                                    : "bg-background-secondary/30"
                                }
                              >
                                <td className="px-6 py-4 border-r border-border font-semibold text-foreground w-1/3">
                                  {key}
                                </td>
                                <td className="px-6 py-4 text-foreground-muted">
                                  {String(value)}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Features Tab */}
              {activeTab === "features" &&
                product.features &&
                product.features.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gradient-earth mb-6">
                      Key Features & Benefits
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-background-tertiary/30 rounded-xl hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                            <Check size={14} className="text-white" />
                          </div>
                          <span className="text-foreground-muted">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Reviews Tab Preview */}
              {activeTab === "reviews" && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Customer Reviews
                  </h3>
                  <p className="text-foreground-muted mb-6">
                    Be the first to review this product
                  </p>
                  <Button className="bg-primary hover:bg-primary-light text-primary-foreground">
                    Write a Review
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gradient-earth">
                  You May Also Like
                </h2>
                <p className="text-foreground-muted mt-2">
                  Discover more products you might love
                </p>
              </div>
              <Link
                href={`/categories/${categorySlug}`}
                className="text-accent hover:text-accent-light transition-colors font-semibold inline-flex items-center gap-2 group"
              >
                View All
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2">
            <Skeleton className="w-full aspect-square rounded-2xl" />
            <div className="flex gap-3 mt-4 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl p-6 md:p-8">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-48 mb-6" />
              <Skeleton className="h-10 w-40 mb-6" />
              <Skeleton className="h-24 w-full mb-8" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
