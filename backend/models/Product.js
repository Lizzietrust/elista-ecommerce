import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      trim: true,
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description cannot exceed 500 characters"],
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Please provide product stock"],
      min: [0, "Stock cannot be negative"],
      default: 0,
      index: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, "Low stock threshold cannot be negative"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide product category"],
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: String,
        thumbnail: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
        altText: String,
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ["g", "kg", "lb", "oz"],
        default: "g",
      },
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ["cm", "in"],
        default: "cm",
      },
    },
    colors: [String],
    sizes: [String],
    tags: [String],
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    features: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Rating fields - Already have these!
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    // Remove embedded ratings array since we're using external Review model
    // ratings: [...],

    salesCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    warranty: {
      period: Number,
      unit: {
        type: String,
        enum: ["days", "months", "years"],
        default: "months",
      },
      description: String,
    },
    returnPolicy: {
      allowed: {
        type: Boolean,
        default: true,
      },
      period: {
        type: Number,
        default: 30,
      },
      unit: {
        type: String,
        enum: ["days"],
        default: "days",
      },
      conditions: String,
    },
    shipping: {
      weightBased: {
        type: Boolean,
        default: false,
      },
      freeShipping: {
        type: Boolean,
        default: false,
      },
      shippingCost: Number,
      estimatedDelivery: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ["days", "weeks"],
          default: "days",
        },
      },
    },
    meta: {
      title: String,
      description: String,
      keywords: [String],
    },
    variants: [
      {
        sku: {
          type: String,
          uppercase: true,
        },
        price: {
          type: Number,
          min: [0, "Variant price cannot be negative"],
        },
        comparePrice: {
          type: Number,
          min: [0, "Variant compare price cannot be negative"],
        },
        stock: {
          type: Number,
          min: [0, "Variant stock cannot be negative"],
          default: 0,
        },
        attributes: [
          {
            name: String,
            value: String,
          },
        ],
        images: [
          {
            url: String,
            publicId: String,
          },
        ],
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
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

// Generate slug before saving
productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  // Generate SKU if not provided
  if (!this.sku && this.name) {
    const namePrefix = this.name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.sku = `${namePrefix}-${randomNum}`;
  }

  // Generate SKU for variants if not provided
  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((variant, index) => {
      if (!variant.sku && this.sku) {
        variant.sku = `${this.sku}-V${index + 1}`;
      }
    });
  }

  next();
});

// Middleware to update category product count when product is saved
productSchema.pre("save", async function (next) {
  // Only run if category is being modified
  if (this.isModified("category")) {
    const Category = mongoose.model("Category");

    // Decrement old category count if product already exists
    if (this.isModified("category") && !this.isNew) {
      try {
        const oldProduct = await this.constructor
          .findById(this._id)
          .select("category");
        if (oldProduct && oldProduct.category) {
          await Category.findByIdAndUpdate(oldProduct.category, {
            $inc: { productCount: -1 },
          });
        }
      } catch (error) {
        console.error("Error updating old category count:", error);
      }
    }

    // Increment new category count
    if (this.category) {
      try {
        await Category.findByIdAndUpdate(this.category, {
          $inc: { productCount: 1 },
        });
      } catch (error) {
        console.error("Error updating new category count:", error);
      }
    }
  }

  next();
});

// Middleware to handle category count when product is deleted
productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const Category = mongoose.model("Category");

    // Decrement category count
    if (this.category) {
      try {
        await Category.findByIdAndUpdate(this.category, {
          $inc: { productCount: -1 },
        });
      } catch (error) {
        console.error("Error decrementing category count:", error);
      }
    }

    next();
  },
);

// ========== UPDATED RATING METHODS ==========

// Update average rating from external Review model
productSchema.methods.updateAverageRatingFromReviews = async function () {
  try {
    const Review = mongoose.model("Review");

    // Get all reviews for this product
    const reviews = await Review.find({
      product: this._id,
      status: "active", // Only count active reviews
    });

    if (reviews.length === 0) {
      this.averageRating = 0;
      this.totalReviews = 0;
    } else {
      // Calculate average rating
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      this.averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal
      this.totalReviews = reviews.length;
    }

    await this.save();
    return this;
  } catch (error) {
    console.error("Error updating average rating from reviews:", error);
    throw error;
  }
};

// Check if user has reviewed this product
productSchema.methods.hasUserReviewed = async function (userId) {
  try {
    const Review = mongoose.model("Review");
    const review = await Review.findOne({
      user: userId,
      product: this._id,
    });
    return !!review;
  } catch (error) {
    console.error("Error checking user review:", error);
    return false;
  }
};

// Get user's review for this product
productSchema.methods.getUserReview = async function (userId) {
  try {
    const Review = mongoose.model("Review");
    return await Review.findOne({
      user: userId,
      product: this._id,
    }).populate("user", "name avatar");
  } catch (error) {
    console.error("Error getting user review:", error);
    return null;
  }
};

// Get product rating summary
productSchema.methods.getRatingSummary = async function () {
  try {
    const Review = mongoose.model("Review");

    const summary = await Review.aggregate([
      {
        $match: {
          product: mongoose.Types.ObjectId(this._id),
          status: "active",
        },
      },
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
  } catch (error) {
    console.error("Error getting rating summary:", error);
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
};

// Get recent reviews for this product
productSchema.methods.getRecentReviews = async function (limit = 5) {
  try {
    const Review = mongoose.model("Review");
    return await Review.find({
      product: this._id,
      status: "active",
    })
      .populate("user", "name avatar")
      .sort("-createdAt")
      .limit(limit);
  } catch (error) {
    console.error("Error getting recent reviews:", error);
    return [];
  }
};

// Get helpful reviews for this product
productSchema.methods.getHelpfulReviews = async function (limit = 5) {
  try {
    const Review = mongoose.model("Review");
    return await Review.find({
      product: this._id,
      status: "active",
    })
      .populate("user", "name avatar")
      .sort("-helpfulCount")
      .limit(limit);
  } catch (error) {
    console.error("Error getting helpful reviews:", error);
    return [];
  }
};

// Check if product is in low stock
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

// Check if product is out of stock
productSchema.virtual("isOutOfStock").get(function () {
  return this.stock <= 0;
});

// Get total stock including variants
productSchema.virtual("totalStock").get(function () {
  let total = this.stock;

  if (this.variants && this.variants.length > 0) {
    total += this.variants.reduce(
      (sum, variant) => sum + (variant.stock || 0),
      0,
    );
  }

  return total;
});

// Get discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(
      ((this.comparePrice - this.price) / this.comparePrice) * 100,
    );
  }
  return 0;
});

// Get default image
productSchema.virtual("defaultImage").get(function () {
  const defaultImg = this.images.find((img) => img.isDefault);
  return defaultImg
    ? defaultImg.url
    : this.images[0]
      ? this.images[0].url
      : null;
});

// Get thumbnail image
productSchema.virtual("thumbnailImage").get(function () {
  const defaultImg = this.images.find((img) => img.isDefault);
  return defaultImg
    ? defaultImg.thumbnail
    : this.images[0]
      ? this.images[0].thumbnail
      : null;
});

// Increment view count
productSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

// Increment sales count
productSchema.methods.incrementSalesCount = function (quantity = 1) {
  this.salesCount += quantity;
  this.stock = Math.max(0, this.stock - quantity);
  return this.save();
};

// Update stock
productSchema.methods.updateStock = function (quantity) {
  this.stock = Math.max(0, quantity);
  return this.save();
};

// Method to add variant
productSchema.methods.addVariant = function (variantData) {
  // Generate SKU if not provided
  if (!variantData.sku) {
    const variantCount = this.variants.length;
    variantData.sku = `${this.sku}-V${variantCount + 1}`;
  }

  this.variants.push(variantData);
  return this.save();
};

// Method to update variant
productSchema.methods.updateVariant = function (variantId, updateData) {
  const variant = this.variants.id(variantId);
  if (variant) {
    Object.assign(variant, updateData);
  }
  return this.save();
};

// Method to delete variant
productSchema.methods.deleteVariant = function (variantId) {
  this.variants = this.variants.filter((v) => v._id.toString() !== variantId);
  return this.save();
};

// Method to toggle variant active status
productSchema.methods.toggleVariantActive = function (variantId) {
  const variant = this.variants.id(variantId);
  if (variant) {
    variant.isActive = !variant.isActive;
  }
  return this.save();
};

// ========== STATIC METHODS ==========

// Static method to find products by category
productSchema.statics.findByCategory = function (categoryId, options = {}) {
  const {
    limit = 10,
    skip = 0,
    sort = "-createdAt",
    isActive = true,
  } = options;

  return this.find({
    category: categoryId,
    isActive,
  })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to find featured products
productSchema.statics.findFeatured = function (limit = 10) {
  return this.find({
    featured: true,
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort("-createdAt")
    .limit(limit);
};

// Static method to find best sellers
productSchema.statics.findBestSellers = function (limit = 10) {
  return this.find({
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort("-salesCount")
    .limit(limit);
};

// Static method to find new arrivals
productSchema.statics.findNewArrivals = function (limit = 10, days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return this.find({
    isActive: true,
    createdAt: { $gte: date },
  })
    .sort("-createdAt")
    .limit(limit);
};

// Static method to find top rated products
productSchema.statics.findTopRated = function (limit = 10, minReviews = 5) {
  return this.find({
    isActive: true,
    stock: { $gt: 0 },
    totalReviews: { $gte: minReviews },
  })
    .sort("-averageRating")
    .limit(limit);
};

// Static method to search products
productSchema.statics.searchProducts = function (searchTerm, options = {}) {
  const { limit = 20, skip = 0 } = options;

  return this.find({
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { brand: { $regex: searchTerm, $options: "i" } },
      { tags: { $regex: searchTerm, $options: "i" } },
    ],
    isActive: true,
  })
    .skip(skip)
    .limit(limit);
};

// Static method to update product rating when review is added/changed/deleted
productSchema.statics.updateProductRating = async function (productId) {
  try {
    const Review = mongoose.model("Review");

    const stats = await Review.aggregate([
      {
        $match: {
          product: mongoose.Types.ObjectId(productId),
          status: "active",
        },
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const updateData = {
      averageRating: 0,
      totalReviews: 0,
    };

    if (stats.length > 0) {
      updateData.averageRating = Math.round(stats[0].averageRating * 10) / 10;
      updateData.totalReviews = stats[0].totalReviews;
    }

    await this.findByIdAndUpdate(productId, updateData);
    return updateData;
  } catch (error) {
    console.error("Error updating product rating:", error);
    throw error;
  }
};

// Static method to get products with reviews
productSchema.statics.getProductsWithReviews = async function (
  query = {},
  options = {},
) {
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
    populateReviews = false,
    reviewsLimit = 3,
  } = options;

  const skip = (page - 1) * limit;

  const products = await this.find(query).sort(sort).skip(skip).limit(limit);

  if (populateReviews) {
    const Review = mongoose.model("Review");

    // Get reviews for each product
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.find({
          product: product._id,
          status: "active",
        })
          .populate("user", "name avatar")
          .limit(reviewsLimit)
          .sort("-createdAt");

        const ratingSummary = await product.getRatingSummary();

        return {
          ...product.toObject(),
          recentReviews: reviews,
          ratingSummary,
        };
      }),
    );

    return productsWithReviews;
  }

  return products;
};

// Add pagination plugin
productSchema.plugin(mongoosePaginate);

// Indexes for better query performance
productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  tags: "text",
});
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ totalReviews: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });
productSchema.index({ subCategory: 1, isActive: 1 });
productSchema.index({ "variants.sku": 1 });
productSchema.index({ "variants.isActive": 1 });

// Compound index for rating filtering
productSchema.index({ averageRating: -1, totalReviews: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
