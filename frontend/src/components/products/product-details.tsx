"use client";

import { useState, useEffect } from "react";
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
  Ruler,
  Tag,
  ThumbsUp,
  Loader2,
  ThumbsDown,
  Flag,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { useProductById } from "@/lib/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCheckInWishlist,
  useToggleWishlist,
} from "@/lib/hooks/use-wishlist";
import {
  useAddToCart,
  useCart,
  useRemoveFromCart,
  useIncrementCartItem,
  useDecrementCartItem,
} from "@/lib/hooks/use-cart";
import {
  useProductReviews,
  useMarkReviewHelpful,
  useReportReview,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  type Review,
} from "@/lib/hooks/use-reviews";
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

const getCategoryId = (
  category: string | ProductCategory | undefined,
): string => {
  if (!category) return "";
  if (typeof category === "object" && category._id) return category._id;
  return "";
};

export function ProductDetails({ productId }: ProductDetailsProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState<number>(0);
  const [reportReason, setReportReason] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data, isLoading, error } = useProductById(productId, {});

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();
  const { mutate: removeFromCart, isPending: isRemovingFromCart } =
    useRemoveFromCart();
  const { mutate: incrementItem, isPending: isIncrementing } =
    useIncrementCartItem();
  const { mutate: decrementItem, isPending: isDecrementing } =
    useDecrementCartItem();

  const { data: cartData, isLoading: isLoadingCart } = useCart();

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    refetch: refetchReviews,
  } = useProductReviews(productId, {
    limit: 10,
    sort: "-createdAt",
  });

  const { mutate: markHelpful, isPending: isMarkingHelpful } =
    useMarkReviewHelpful();
  const { mutate: reportReview, isPending: isReporting } = useReportReview();
  const { mutate: createReview, isPending: isCreatingReview } =
    useCreateReview();
  const { mutate: updateReview, isPending: isUpdatingReview } =
    useUpdateReview();
  const { mutate: deleteReview, isPending: isDeletingReview } =
    useDeleteReview();

  const isAuthenticated =
    typeof window !== "undefined" ? !!localStorage.getItem("token") : false;

  const getCurrentUserId = (): string | null => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const parsed = JSON.parse(user);
          return parsed._id || parsed.id || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const userReview = reviewsData?.data?.find(
    (review: Review) => review.user?._id === getCurrentUserId(),
  );
  const hasUserReviewed = !!userReview;

  useEffect(() => {
    if (cartData?.items && productId) {
      const cartItem = cartData.items.find(
        (item) =>
          item.product._id === productId || item.product.id === productId,
      );
      if (cartItem) {
        setCartItemId(cartItem._id);
        setCartQuantity(cartItem.quantity);
        setIsAddedToCart(true);
        setQuantity(cartItem.quantity);
      } else {
        setCartItemId(null);
        setCartQuantity(0);
        setIsAddedToCart(false);
        setQuantity(1);
      }
    }
  }, [cartData, productId]);

  const { data: wishlistData, isLoading: isCheckingWishlist } =
    useCheckInWishlist(productId, {
      enabled: isAuthenticated && !!productId,
    });

  const wishlistCheckData = wishlistData as CheckInWishlistResponse | undefined;
  const isInWishlist = wishlistCheckData?.isInWishlist ?? false;

  const { mutate: toggleWishlist, isPending: isTogglingWishlist } =
    useToggleWishlist();

  const handleMarkHelpful = (reviewId: string, isHelpful: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please login to mark reviews as helpful", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    markHelpful(
      { id: reviewId, isHelpful },
      {
        onSuccess: () => {
          refetchReviews();
        },
        onError: (error: any) => {
          console.error("Error marking review:", error);
          toast.error(error?.message || "Failed to mark review", {
            duration: 3000,
            position: "bottom-center",
          });
        },
      },
    );
  };

  const handleReportReview = (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error("Please login to report reviews", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    if (!reportReason) {
      toast.error("Please select a reason for reporting", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    reportReview(
      { id: reviewId, reason: reportReason },
      {
        onSuccess: () => {
          toast.success("Review reported successfully", {
            duration: 3000,
            position: "bottom-center",
          });
          setShowReportModal(false);
          setReportReason("");
          setSelectedReviewId(null);
          refetchReviews();
        },
        onError: (error: any) => {
          console.error("Error reporting review:", error);
          toast.error(error?.message || "Failed to report review", {
            duration: 3000,
            position: "bottom-center",
          });
        },
      },
    );
  };

  const handleOpenReviewForm = (review?: Review) => {
    if (!isAuthenticated) {
      toast.error("Please login to write a review", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    if (hasUserReviewed && !review) {
      toast.error("You have already reviewed this product", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    if (review) {
      setEditingReview(review);
      setReviewRating(review.rating);
      setReviewTitle(review.title || "");
      setReviewComment(review.comment);
    } else {
      setEditingReview(null);
      setReviewRating(0);
      setReviewTitle("");
      setReviewComment("");
      setReviewImages([]);
    }
    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewRating(0);
    setReviewTitle("");
    setReviewComment("");
    setReviewImages([]);
    setHoveredRating(0);
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast.error("Please login to submit a review", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    if (reviewRating === 0) {
      toast.error("Please select a rating", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      toast.error("Review must be at least 10 characters", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    setIsSubmittingReview(true);

    const reviewData = {
      product: productId,
      rating: reviewRating,
      title: reviewTitle.trim() || undefined,
      comment: reviewComment.trim(),
      images: [],
    };

    if (editingReview) {
      updateReview(
        {
          id: editingReview._id,
          payload: {
            rating: reviewRating,
            title: reviewTitle.trim() || undefined,
            comment: reviewComment.trim(),
          },
        },
        {
          onSuccess: () => {
            toast.success("Review updated successfully!", {
              duration: 3000,
              position: "bottom-center",
            });
            handleCloseReviewForm();
            refetchReviews();
          },
          onError: (error: any) => {
            console.error("Error updating review:", error);
            toast.error(error?.message || "Failed to update review", {
              duration: 3000,
              position: "bottom-center",
            });
          },
          onSettled: () => {
            setIsSubmittingReview(false);
          },
        },
      );
    } else {
      createReview(reviewData, {
        onSuccess: () => {
          toast.success("Review submitted successfully!", {
            duration: 3000,
            position: "bottom-center",
          });
          handleCloseReviewForm();
          refetchReviews();
        },
        onError: (error: any) => {
          console.error("Error submitting review:", error);
          toast.error(error?.message || "Failed to submit review", {
            duration: 3000,
            position: "bottom-center",
          });
        },
        onSettled: () => {
          setIsSubmittingReview(false);
        },
      });
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    deleteReview(reviewId, {
      onSuccess: () => {
        toast.success("Review deleted successfully!", {
          duration: 3000,
          position: "bottom-center",
        });
        refetchReviews();
      },
      onError: (error: any) => {
        console.error("Error deleting review:", error);
        toast.error(error?.message || "Failed to delete review", {
          duration: 3000,
          position: "bottom-center",
        });
      },
    });
  };

  const handleRatingClick = (rating: number) => {
    setReviewRating(rating);
  };

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleRatingLeave = () => {
    setHoveredRating(0);
  };

  const isLoadingWishlist = isCheckingWishlist || isTogglingWishlist;
  const isCartLoading =
    isLoadingCart ||
    isAddingToCart ||
    isRemovingFromCart ||
    isIncrementing ||
    isDecrementing;

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  const categoryName = getCategoryName(product?.category);
  const categoryId = getCategoryId(product?.category);

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

  const discountPercentage =
    product?.comparePrice && product?.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100,
        )
      : 0;

  const reviewStats = reviewsData?.statistics;
  const averageRating = reviewStats?.averageRating
    ? typeof reviewStats.averageRating === "string"
      ? parseFloat(reviewStats.averageRating)
      : reviewStats.averageRating
    : product?.averageRating || product?.rating || 0;

  const reviewCount = reviewStats?.totalReviews || product?.reviewCount || 0;
  const ratingDistribution = reviewStats?.ratingDistribution || null;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock ?? 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart", {
        duration: 3000,
        position: "bottom-center",
      });
      router.push("/login");
      return;
    }

    if (product?.stock === 0) {
      toast.error("Product is out of stock", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    if (isAddedToCart && cartItemId) {
      incrementItem(cartItemId, {
        onSuccess: (response) => {
          if (response?.data) {
            setCartQuantity(response.data.quantity);
            setQuantity(response.data.quantity);
          }
        },
        onError: (error) => {
          console.error("Increment error:", error);
          toast.error("Failed to update quantity", {
            duration: 3000,
            position: "bottom-center",
          });
        },
      });
      return;
    }

    addToCart(
      { productId, quantity },
      {
        onSuccess: (response) => {
          setIsAddedToCart(true);
          if (response?.data?.items) {
            const addedItem = response.data.items.find(
              (item) =>
                item.product._id === productId || item.product.id === productId,
            );
            if (addedItem) {
              setCartItemId(addedItem._id);
              setCartQuantity(addedItem.quantity);
              setQuantity(addedItem.quantity);
            }
          }
          toast.success(`${product?.name} added to cart!`, {
            duration: 2000,
            position: "bottom-center",
          });
        },
        onError: (error) => {
          console.error("Add to cart error:", error);
          toast.error("Failed to add to cart", {
            duration: 3000,
            position: "bottom-center",
          });
        },
      },
    );
  };

  const handleIncrement = () => {
    if (!cartItemId) return;

    if (cartQuantity >= (product?.stock ?? 0)) {
      toast.error("Cannot add more. Stock limit reached.", {
        duration: 2000,
        position: "bottom-center",
      });
      return;
    }

    incrementItem(cartItemId, {
      onSuccess: (response) => {
        if (response?.data) {
          setCartQuantity(response.data.quantity);
          setQuantity(response.data.quantity);
        }
      },
      onError: (error) => {
        console.error("Increment error:", error);
        toast.error("Failed to update quantity", {
          duration: 3000,
          position: "bottom-center",
        });
      },
    });
  };

  const handleDecrement = () => {
    if (!cartItemId) return;

    if (cartQuantity === 1) {
      removeFromCart(cartItemId, {
        onSuccess: () => {
          setIsAddedToCart(false);
          setCartItemId(null);
          setCartQuantity(0);
          setQuantity(1);
          toast.success("Removed from cart", {
            duration: 2000,
            position: "bottom-center",
          });
        },
        onError: (error) => {
          console.error("Remove from cart error:", error);
          toast.error("Failed to remove from cart", {
            duration: 3000,
            position: "bottom-center",
          });
        },
      });
    } else {
      decrementItem(cartItemId, {
        onSuccess: (response) => {
          if (response?.data) {
            if (response.data.removed) {
              setIsAddedToCart(false);
              setCartItemId(null);
              setCartQuantity(0);
              setQuantity(1);
            } else {
              setCartQuantity(response.data.quantity);
              setQuantity(response.data.quantity);
            }
          }
        },
        onError: (error) => {
          console.error("Decrement error:", error);
          toast.error("Failed to update quantity", {
            duration: 3000,
            position: "bottom-center",
          });
        },
      });
    }
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

    if (!product) {
      toast.error("Product data not available", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    toggleWishlist(
      {
        product: product,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {editingReview ? "Edit Review" : "Write a Review"}
              </h3>
              <button
                onClick={handleCloseReviewForm}
                className="text-foreground-muted hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Rating Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    onMouseEnter={() => handleRatingHover(rating)}
                    onMouseLeave={handleRatingLeave}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      fill={
                        rating <= (hoveredRating || reviewRating)
                          ? "currentColor"
                          : "none"
                      }
                      className={
                        rating <= (hoveredRating || reviewRating)
                          ? "text-accent"
                          : "text-muted-foreground"
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-foreground-muted mt-1">
                {reviewRating > 0 &&
                  ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                    reviewRating
                  ]}
              </p>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-4 py-2 rounded-xl border border-border bg-background-secondary text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                maxLength={200}
              />
            </div>

            {/* Comment Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Review *
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={5}
                className="w-full px-4 py-2 rounded-xl border border-border bg-background-secondary text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none resize-none"
                minLength={10}
                maxLength={2000}
              />
              <p className="text-sm text-foreground-muted mt-1 text-right">
                {reviewComment.length}/2000
              </p>
            </div>

            {/* Image Upload (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Images (Optional)
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="review-images"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setReviewImages(files);
                  }}
                />
                <label
                  htmlFor="review-images"
                  className="cursor-pointer text-foreground-muted hover:text-foreground transition-colors"
                >
                  <div className="text-4xl mb-2">📸</div>
                  <p>Click to upload images</p>
                  <p className="text-sm">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
              {reviewImages.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {reviewImages.map((file, index) => (
                    <div
                      key={index}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-border"
                    >
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCloseReviewForm}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary-light text-primary-foreground"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview || reviewRating === 0}
              >
                {isSubmittingReview ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {editingReview ? "Updating..." : "Submitting..."}
                  </>
                ) : editingReview ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Report Review
            </h3>
            <p className="text-foreground-muted text-sm mb-4">
              Please select a reason for reporting this review
            </p>
            <div className="space-y-2 mb-4">
              {[
                "spam",
                "inappropriate",
                "false_information",
                "hate_speech",
                "other",
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full text-left px-4 py-2 rounded-lg border transition-all duration-200 ${
                    reportReason === reason
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {reason.charAt(0).toUpperCase() + reason.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setSelectedReviewId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-destructive hover:bg-destructive/80"
                onClick={() =>
                  selectedReviewId && handleReportReview(selectedReviewId)
                }
                disabled={!reportReason || isReporting}
              >
                {isReporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Report"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

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
              href="/products"
              className="text-foreground-muted hover:text-accent transition-colors duration-300"
            >
              Products
            </Link>
            <ChevronLeft
              size={14}
              className="rotate-180 text-foreground-muted"
            />
            {categoryId ? (
              <Link
                href={`/products?category=${categoryId}`}
                className="text-foreground-muted hover:text-accent transition-colors duration-300"
              >
                {categoryName}
              </Link>
            ) : (
              <span className="text-foreground-muted">{categoryName}</span>
            )}
            <ChevronLeft
              size={14}
              className="rotate-180 text-foreground-muted"
            />
            <span className="text-foreground font-semibold truncate max-w-50">
              {product?.name}
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
                {product?.images && product.images[selectedImage] ? (
                  <Image
                    src={
                      typeof product.images[selectedImage] === "string"
                        ? product.images[selectedImage]
                        : product.images[selectedImage].url
                    }
                    alt={
                      typeof product.images[selectedImage] === "object"
                        ? product.images[selectedImage].alt || product?.name
                        : product?.name || "Product image"
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
            {product?.images && product.images.length > 1 && (
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
                          alt={imageAlt || "Product thumbnail"}
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
                  {categoryId ? (
                    <Link
                      href={`/products?category=${categoryId}`}
                      className="text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <Tag size={14} />
                      {categoryName}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-foreground-muted inline-flex items-center gap-1">
                      <Tag size={14} />
                      {categoryName}
                    </span>
                  )}
                  {product?.brand && (
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
                  {product?.isFeatured && (
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
                  {product?.name}
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
                            product?.averageRating &&
                            i < Math.floor(Number(product.averageRating))
                              ? "currentColor"
                              : "none"
                          }
                          className="transition-all"
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {product?.averageRating
                        ? Number(product.averageRating).toFixed(1)
                        : "0.0"}
                    </span>
                  </div>
                  <span className="text-foreground-muted">
                    ({product?.reviewCount || 0} reviews)
                  </span>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      (product?.stock ?? 0) > 10
                        ? "bg-success/10 text-success"
                        : (product?.stock ?? 0) > 0
                          ? "bg-accent/10 text-accent"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        (product?.stock ?? 0) > 10
                          ? "bg-success"
                          : (product?.stock ?? 0) > 0
                            ? "bg-accent"
                            : "bg-destructive"
                      } animate-pulse`}
                    />
                    {(product?.stock ?? 0) > 10
                      ? "In Stock"
                      : (product?.stock ?? 0) > 0
                        ? `Only ${product?.stock} left`
                        : "Out of Stock"}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-gradient-warm rounded-xl">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-foreground">
                    ${product?.price?.toFixed(2) || "0.00"}
                  </span>
                  {product?.comparePrice && product.comparePrice > 0 && (
                    <>
                      <span className="text-xl line-through text-foreground-muted">
                        ${product.comparePrice.toFixed(2)}
                      </span>
                      <span className="px-2 py-1 bg-linear-to-r from-destructive to-accent text-white text-sm font-bold rounded-full shadow-md">
                        Save $
                        {(product.comparePrice - (product?.price || 0)).toFixed(
                          2,
                        )}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-foreground-muted">
                  or 4 interest-free payments of $
                  {((product?.price || 0) / 4).toFixed(2)} with
                  <span className="font-semibold ml-1 text-accent">
                    Elista Pay
                  </span>
                </p>
              </div>

              {/* Short Description */}
              <div className="mb-8 p-4 bg-background-tertiary/30 rounded-xl">
                <p className="text-foreground-muted leading-relaxed">
                  {product?.description}
                </p>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {isAddedToCart && cartItemId ? (
                    <div className="flex items-center justify-between border-2 border-accent rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                      <button
                        onClick={handleDecrement}
                        disabled={isCartLoading || cartQuantity <= 1}
                        className="h-12 w-12 flex items-center justify-center text-foreground-muted hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDecrementing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Minus size={16} />
                        )}
                      </button>
                      <div className="h-12 w-16 flex items-center justify-center font-bold text-foreground">
                        {cartQuantity}
                      </div>
                      <button
                        onClick={handleIncrement}
                        disabled={
                          isCartLoading || cartQuantity >= (product?.stock ?? 0)
                        }
                        className="h-12 w-12 flex items-center justify-center text-foreground-muted hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isIncrementing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>
                    </div>
                  ) : (
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
                        disabled={quantity >= (product?.stock ?? 0)}
                        className="h-12 w-12 flex items-center justify-center text-foreground-muted hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}

                  <Button
                    onClick={handleAddToCart}
                    disabled={product?.stock === 0 || isCartLoading}
                    className="flex-1 py-3 text-lg gap-3 bg-primary hover:bg-primary-light text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isCartLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : isAddedToCart ? (
                      <>
                        <Check size={20} />
                        Update Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart
                      </>
                    )}
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
                      to add items to your cart and wishlist
                    </p>
                  </div>
                )}

                {(product?.stock ?? 0) < 10 && (product?.stock ?? 0) > 0 && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-xl border border-accent/20">
                    <div className="flex items-center gap-2 text-accent">
                      <Clock size={16} className="animate-pulse" />
                      <span className="font-semibold text-sm">
                        Hurry! Only {product?.stock} left in stock
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
                  {
                    id: "reviews",
                    label: `Reviews (${reviewCount})`,
                    icon: <Star size={18} />,
                  },
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
                    {product?.longDescription || product?.description}
                  </div>
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === "specifications" &&
                product?.specifications &&
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
                product?.features &&
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

              {/* Reviews Tab - Integrated with API */}
              {activeTab === "reviews" && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gradient-earth">
                        Customer Reviews
                      </h2>
                      <p className="text-foreground-muted mt-2">
                        {reviewCount} verified reviews
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {isAuthenticated && (
                        <>
                          {hasUserReviewed ? (
                            <>
                              <Button
                                variant="outline"
                                className="border-accent text-accent hover:bg-accent/5"
                                onClick={() => handleOpenReviewForm(userReview)}
                              >
                                <Edit size={16} className="mr-2" />
                                Edit Review
                              </Button>
                              <Button
                                variant="outline"
                                className="border-destructive text-destructive hover:bg-destructive/5"
                                onClick={() =>
                                  userReview &&
                                  handleDeleteReview(userReview._id)
                                }
                                disabled={isDeletingReview}
                              >
                                {isDeletingReview ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} className="mr-2" />
                                )}
                                Delete
                              </Button>
                            </>
                          ) : (
                            <Button
                              className="bg-primary hover:bg-primary-light text-primary-foreground transition-all duration-300"
                              onClick={() => handleOpenReviewForm()}
                            >
                              Write a Review
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rating Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center p-6 bg-muted rounded-xl border border-border">
                      <div className="text-5xl font-bold text-foreground mb-2">
                        {Number(averageRating).toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            fill={
                              i < Math.floor(Number(averageRating))
                                ? "currentColor"
                                : "none"
                            }
                            className="text-accent"
                          />
                        ))}
                      </div>
                      <div className="text-foreground-muted">
                        Overall Rating
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      {ratingDistribution ? (
                        <div className="space-y-3">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const dist =
                              ratingDistribution[stars as 1 | 2 | 3 | 4 | 5];
                            if (!dist) return null;
                            return (
                              <div
                                key={stars}
                                className="flex items-center gap-3"
                              >
                                <div className="flex items-center gap-1 w-16">
                                  <span className="text-sm font-medium text-foreground">
                                    {stars}
                                  </span>
                                  <Star size={14} className="text-accent" />
                                </div>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent rounded-full transition-all duration-300"
                                    style={{
                                      width: `${dist.percentage || 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-foreground-muted w-12 text-right">
                                  {dist.percentage || 0}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-foreground-muted">
                            No reviews yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reviews List */}
                  {isLoadingReviews ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border-b border-border pb-6">
                          <Skeleton className="h-6 w-48 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviewsData?.data?.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">⭐</div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            No Reviews Yet
                          </h3>
                          <p className="text-foreground-muted">
                            Be the first to review this product
                          </p>
                          {isAuthenticated && (
                            <Button
                              className="mt-4 bg-primary hover:bg-primary-light text-primary-foreground"
                              onClick={() => handleOpenReviewForm()}
                            >
                              Write a Review
                            </Button>
                          )}
                        </div>
                      ) : (
                        reviewsData?.data?.map((review: Review) => {
                          const isOwnReview =
                            review.user?._id === getCurrentUserId();
                          return (
                            <div
                              key={review._id}
                              className="border-b border-border pb-6 last:border-0"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="flex text-accent">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={14}
                                          fill={
                                            i < review.rating
                                              ? "currentColor"
                                              : "none"
                                          }
                                        />
                                      ))}
                                    </div>
                                    {review.verifiedPurchase && (
                                      <span className="flex items-center gap-1 text-xs text-success">
                                        <Check size={12} />
                                        Verified
                                      </span>
                                    )}
                                    {isOwnReview && (
                                      <span className="flex items-center gap-1 text-xs text-accent">
                                        <Edit size={10} />
                                        Your Review
                                      </span>
                                    )}
                                  </div>
                                  {review.title && (
                                    <h4 className="font-semibold text-foreground">
                                      {review.title}
                                    </h4>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-foreground-muted mt-1">
                                    <span>
                                      by {review.user?.name || "Anonymous"}
                                    </span>
                                    <span>•</span>
                                    <span>{review.timeAgo || "Recently"}</span>
                                    {review.edited && (
                                      <>
                                        <span>•</span>
                                        <span className="italic text-xs">
                                          (edited)
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isOwnReview && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleOpenReviewForm(review)
                                        }
                                        className="text-foreground-muted hover:text-accent transition-colors p-1"
                                        aria-label="Edit review"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteReview(review._id)
                                        }
                                        className="text-foreground-muted hover:text-destructive transition-colors p-1"
                                        aria-label="Delete review"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  )}
                                  {!isOwnReview && isAuthenticated && (
                                    <button
                                      onClick={() => {
                                        setSelectedReviewId(review._id);
                                        setShowReportModal(true);
                                      }}
                                      className="text-foreground-muted hover:text-destructive transition-colors p-1"
                                      aria-label="Report review"
                                    >
                                      <Flag size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="text-foreground-muted mb-4">
                                {review.comment}
                              </p>

                              {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                  {review.images.map((img, idx) => (
                                    <div
                                      key={idx}
                                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-border"
                                    >
                                      <Image
                                        src={img.url}
                                        alt={`Review image ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() =>
                                    handleMarkHelpful(review._id, true)
                                  }
                                  disabled={isMarkingHelpful || isOwnReview}
                                  className="flex items-center gap-1 text-sm text-foreground-muted hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ThumbsUp size={14} />
                                  <span>
                                    Helpful ({review.helpfulCount || 0})
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleMarkHelpful(review._id, false)
                                  }
                                  disabled={isMarkingHelpful || isOwnReview}
                                  className="flex items-center gap-1 text-sm text-foreground-muted hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ThumbsDown size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
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
              {categoryId ? (
                <Link
                  href={`/products?category=${categoryId}`}
                  className="text-accent hover:text-accent-light transition-colors font-semibold inline-flex items-center gap-2 group"
                >
                  View All
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              ) : (
                <Link
                  href="/products"
                  className="text-accent hover:text-accent-light transition-colors font-semibold inline-flex items-center gap-2 group"
                >
                  View All
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              )}
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
