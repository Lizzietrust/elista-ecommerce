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
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
        sku: String,
        price: Number,
        comparePrice: Number,
        stock: Number,
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
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
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

  next();
});

// Update average rating when reviews change
productSchema.methods.updateAverageRating = async function () {
  const reviews = this.ratings;

  if (reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / reviews.length;
    this.totalReviews = reviews.length;
  }

  await this.save();
};

// Check if product is in low stock
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

// Check if product is out of stock
productSchema.virtual("isOutOfStock").get(function () {
  return this.stock <= 0;
});

// Get discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(
      ((this.comparePrice - this.price) / this.comparePrice) * 100
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

// Method to add variant
productSchema.methods.addVariant = function (variantData) {
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
productSchema.index({ salesCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
                                    