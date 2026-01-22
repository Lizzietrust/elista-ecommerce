import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
          maxlength: 500,
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
        },
      },
    ],
    name: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "My Wishlist",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    shareExpiresAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create a wishlist for user if doesn't exist
wishlistSchema.statics.getOrCreateWishlist = async function (userId) {
  let wishlist = await this.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await this.create({
      user: userId,
      items: [],
    });
  }

  return wishlist;
};

// Add product to wishlist
wishlistSchema.methods.addItem = async function (productId, options = {}) {
  const { notes, priority = "medium", variant } = options;

  // Check if product already exists in wishlist
  const existingItemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId.toString(),
  );

  if (existingItemIndex >= 0) {
    // Update existing item
    this.items[existingItemIndex].addedAt = Date.now();
    if (notes !== undefined) this.items[existingItemIndex].notes = notes;
    if (priority !== undefined)
      this.items[existingItemIndex].priority = priority;
    if (variant !== undefined) this.items[existingItemIndex].variant = variant;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      notes,
      priority,
      variant,
      addedAt: Date.now(),
    });
  }

  await this.save();
  return this;
};

// Remove product from wishlist
wishlistSchema.methods.removeItem = async function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString(),
  );
  await this.save();
  return this;
};

// Clear all items from wishlist
wishlistSchema.methods.clear = async function () {
  this.items = [];
  await this.save();
  return this;
};

// Check if product is in wishlist
wishlistSchema.methods.hasItem = function (productId) {
  return this.items.some(
    (item) => item.product.toString() === productId.toString(),
  );
};

// Get item by product ID
wishlistSchema.methods.getItem = function (productId) {
  return this.items.find(
    (item) => item.product.toString() === productId.toString(),
  );
};

// Generate share token
wishlistSchema.methods.generateShareToken = async function (expiryDays = 7) {
  const token = require("crypto").randomBytes(32).toString("hex");
  this.shareToken = token;
  this.shareExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  this.isPublic = true;
  await this.save();
  return token;
};

// Revoke share token
wishlistSchema.methods.revokeShareToken = async function () {
  this.shareToken = undefined;
  this.shareExpiresAt = undefined;
  this.isPublic = false;
  await this.save();
  return this;
};

// Check if share token is valid
wishlistSchema.methods.isShareTokenValid = function () {
  if (!this.shareToken || !this.shareExpiresAt) return false;
  return Date.now() < this.shareExpiresAt;
};

// Get wishlist items with product details
wishlistSchema.methods.getItemsWithProducts = async function () {
  await this.populate({
    path: "items.product",
    select: "name price images averageRating totalReviews stock isActive",
  });

  return this.items.map((item) => ({
    ...item.toObject(),
    product: item.product,
  }));
};

// Get wishlist summary
wishlistSchema.virtual("summary").get(function () {
  return {
    itemCount: this.items.length,
    totalEstimatedCost: 0, // You can calculate this by populating products
    createdAt: this.createdAt,
    lastUpdated: this.updatedAt,
  };
});

// Get wishlist items count
wishlistSchema.virtual("itemCount").get(function () {
  return this.items.length;
});

// Check if wishlist is empty
wishlistSchema.virtual("isEmpty").get(function () {
  return this.items.length === 0;
});

// Get recently added items (last 7 days)
wishlistSchema.methods.getRecentlyAdded = function (days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.items.filter((item) => item.addedAt > cutoffDate);
};

// Static method to get wishlist by share token
wishlistSchema.statics.findByShareToken = async function (token) {
  return this.findOne({
    shareToken: token,
    shareExpiresAt: { $gt: new Date() },
    isPublic: true,
  }).populate({
    path: "items.product",
    select: "name price images averageRating isActive",
  });
};

// Indexes for better query performance
wishlistSchema.index({ user: 1 }, { unique: true });
wishlistSchema.index({ shareToken: 1 });
wishlistSchema.index({ "items.product": 1 });
wishlistSchema.index({ "items.addedAt": -1 });
wishlistSchema.index({ createdAt: -1 });
wishlistSchema.index({ shareExpiresAt: 1 }, { expireAfterSeconds: 0 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
