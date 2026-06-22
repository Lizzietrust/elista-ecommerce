"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Share2,
  ShoppingBag,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { typedApiClient } from "@/lib/api/client";
import type { WishlistItem } from "@/lib/api/wishlist";
import type { ProductCategory } from "@/types";

interface SharedWishlistData {
  wishlist: {
    id: string;
    name: string;
    itemCount: number;
    createdAt: string;
    shareExpiresAt: string;
  };
  user: {
    name: string;
    avatar?: string;
  };
  items: WishlistItem[];
}

const getCategoryName = (
  category: string | ProductCategory | undefined,
): string => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  if (typeof category === "object" && category.name) return category.name;
  return "Uncategorized";
};

export default function SharedWishlistPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [data, setData] = useState<SharedWishlistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedWishlist = async () => {
      if (!token) {
        setError("Invalid share link");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await typedApiClient.get<{
          success: boolean;
          data: SharedWishlistData;
        }>(`/wishlist/share/${token}`);

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError("Failed to load shared wishlist");
        }
      } catch (err: any) {
        console.error("Error fetching shared wishlist:", err);
        if (err.status === 404) {
          setError("This wishlist link has expired or is no longer available.");
        } else {
          setError(
            err.message ||
              "Failed to load the shared wishlist. Please try again.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedWishlist();
  }, [token]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          toast.success("Link copied to clipboard!");
        })
        .catch(() => {
          toast.error("Failed to copy link");
        });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-destructive/10 rounded-2xl p-8">
            <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Wishlist Not Found
            </h2>
            <p className="text-foreground-muted mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="gap-2 bg-primary hover:bg-primary-light">
                  <ChevronLeft size={16} />
                  Go Home
                </Button>
              </Link>
              <Link href="/wishlist">
                <Button variant="outline" className="border-border">
                  My Wishlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="h-24 w-24 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-foreground-muted" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Empty Wishlist
          </h2>
          <p className="text-foreground-muted mb-6">
            This wishlist doesn't have any items yet.
          </p>
          <Link href="/">
            <Button className="gap-2 bg-primary hover:bg-primary-light">
              <ChevronLeft size={16} />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { wishlist, user, items } = data;

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <ChevronLeft size={14} className="rotate-180" />
          <span className="text-foreground">Shared Wishlist</span>
        </div>

        {/* Header */}
        <div className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Heart className="text-accent" size={20} />
                </div>
                <span className="text-sm font-semibold text-accent">
                  Shared Wishlist
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {user?.name || "Someone"}'s Wishlist
              </h1>
              <p className="text-foreground-muted mt-2 flex items-center gap-2">
                <Calendar size={16} />
                Created{" "}
                {new Date(wishlist.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                <span className="text-border">•</span>
                {wishlist.itemCount}{" "}
                {wishlist.itemCount === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="gap-2 border-border hover:border-accent hover:bg-accent/5"
              >
                <Share2 size={16} />
                Copy Link
              </Button>
              <Link href="/">
                <Button className="gap-2 bg-primary hover:bg-primary-light">
                  <ShoppingBag size={16} />
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.product._id} className="relative">
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

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-foreground-muted">
            This wishlist was shared via Elista.{" "}
            <Link href="/" className="text-accent hover:underline font-medium">
              Create your own wishlist
            </Link>
          </p>
          {wishlist.shareExpiresAt && (
            <p className="text-xs text-foreground-muted mt-2">
              This link will expire on{" "}
              {new Date(wishlist.shareExpiresAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
