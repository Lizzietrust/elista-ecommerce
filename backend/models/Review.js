import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    images: [
      {
        url: String,
        public_id: String,
        caption: String,
      },
    ],
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "flagged", "hidden", "removed"],
      default: "active",
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          enum: [
            "spam",
            "inappropriate",
            "false_information",
            "hate_speech",
            "other",
          ],
        },
        description: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index to ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Index for common queries
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ helpfulCount: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: 1 });

// Virtual for formatted date
reviewSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for time ago
reviewSchema.virtual("timeAgo").get(function () {
  const seconds = Math.floor((new Date() - this.createdAt) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval + " year" + (interval === 1 ? "" : "s") + " ago";
  }

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + " month" + (interval === 1 ? "" : "s") + " ago";
  }

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + " day" + (interval === 1 ? "" : "s") + " ago";
  }

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
  }

  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
  }

  return Math.floor(seconds) + " seconds ago";
});

// Static method to get product rating summary
reviewSchema.statics.getProductRatingSummary = async function (productId) {
  const summary = await this.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingCounts: {
          $push: "$rating",
        },
      },
    },
  ]);

  if (summary.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }

  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  summary[0].ratingCounts.forEach((rating) => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  // Calculate percentages
  Object.keys(distribution).forEach((key) => {
    distribution[key] = {
      count: distribution[key],
      percentage: Math.round(
        (distribution[key] / summary[0].totalReviews) * 100,
      ),
    };
  });

  return {
    averageRating: summary[0].averageRating.toFixed(1),
    totalReviews: summary[0].totalReviews,
    ratingDistribution: distribution,
  };
};

// Static method to get user's review for a product
reviewSchema.statics.getUserProductReview = async function (userId, productId) {
  return this.findOne({
    user: userId,
    product: productId,
  }).populate("product", "name images");
};

// Static method to get top rated products
reviewSchema.statics.getTopRatedProducts = async function (limit = 10) {
  const topProducts = await this.aggregate([
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
    { $sort: { averageRating: -1, reviewCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        product: {
          _id: "$product._id",
          name: "$product.name",
          images: "$product.images",
          price: "$product.price",
        },
        averageRating: { $round: ["$averageRating", 1] },
        reviewCount: 1,
      },
    },
  ]);

  return topProducts;
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
