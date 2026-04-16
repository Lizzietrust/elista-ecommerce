"use client";

import { useState } from "react";
import { Star, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  date: string;
  verified: boolean;
  helpful: number;
  tags: string[];
}

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

export function ProductReviews({
  productId,
  averageRating,
  reviewCount,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      rating: 5,
      title: "Excellent Product!",
      content:
        "Absolutely love these headphones! The noise cancellation is incredible and the battery life lasts through my entire work week. Highly recommend!",
      author: "Alex Johnson",
      date: "2 weeks ago",
      verified: true,
      helpful: 24,
      tags: ["Great Sound", "Comfortable", "Long Battery"],
    },
    {
      id: "2",
      rating: 4,
      title: "Great value for money",
      content:
        "Good sound quality and comfortable fit. Battery life is as advertised. The only minor issue is the case could be more compact.",
      author: "Sarah Miller",
      date: "1 month ago",
      verified: true,
      helpful: 12,
      tags: ["Good Value", "Comfortable"],
    },
    {
      id: "3",
      rating: 5,
      title: "Best headphones I've owned",
      content:
        "Worth every penny. The noise cancellation works perfectly in loud environments. Very comfortable for long listening sessions.",
      author: "Michael Chen",
      date: "3 days ago",
      verified: true,
      helpful: 8,
      tags: ["Noise Cancelling", "Comfortable", "Premium"],
    },
  ]);

  const ratingDistribution = [
    { stars: 5, count: 85, percentage: 68 },
    { stars: 4, count: 25, percentage: 20 },
    { stars: 3, count: 10, percentage: 8 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 2, percentage: 2 },
  ];

  const handleHelpful = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review,
      ),
    );
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Customer Reviews
          </h2>
          <p className="text-muted-foreground mt-2">
            {reviewCount} verified reviews
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-light text-primary-foreground transition-all duration-300">
          Write a Review
        </Button>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="text-center p-6 bg-muted rounded-xl border border-border">
          <div className="text-5xl font-bold text-foreground mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                fill={i < Math.floor(averageRating) ? "currentColor" : "none"}
                className="text-accent"
              />
            ))}
          </div>
          <div className="text-muted-foreground">Overall Rating</div>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-3">
            {ratingDistribution.map(({ stars, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-foreground">
                    {stars}
                  </span>
                  <Star size={14} className="text-accent" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-border pb-6 last:border-0"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-foreground">{review.title}</h4>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    by {review.author} • {review.date}
                  </span>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-sm text-success">
                      <Check size={12} />
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{review.content}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleHelpful(review.id)}
                className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                Helpful ({review.helpful})
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
              >
                Report
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button
          variant="outline"
          className="border-border hover:bg-muted hover:text-accent transition-all duration-300"
        >
          Load More Reviews
        </Button>
      </div>
    </div>
  );
}
