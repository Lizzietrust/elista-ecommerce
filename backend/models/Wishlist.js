import mongoose from "mongoose";
import crypto from "crypto";

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

wishlistSchema.methods.addItem = async function (productId, options = {}) {
  const { notes, priority = "medium", variant } = options;

  const existingItemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId.toString(),
  );

  if (existingItemIndex >= 0) {
    this.items[existingItemIndex].addedAt = Date.now();
    if (notes !== undefined) this.items[existingItemIndex].notes = notes;
    if (priority !== undefined)
      this.items[existingItemIndex].priority = priority;
    if (variant !== undefined) this.items[existingItemIndex].variant = variant;
  } else {
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

wishlistSchema.methods.removeItem = async function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString(),
  );
  await this.save();
  return this;
};

wishlistSchema.methods.clear = async function () {
  this.items = [];
  await this.save();
  return this;
};

wishlistSchema.methods.hasItem = function (productId) {
  return this.items.some(
    (item) => item.product.toString() === productId.toString(),
  );
};

wishlistSchema.methods.getItem = function (productId) {
  return this.items.find(
    (item) => item.product.toString() === productId.toString(),
  );
};

wishlistSchema.methods.generateShareToken = async function (expiryDays = 7) {
  const token = crypto.randomBytes(32).toString("hex");
  this.shareToken = token;
  this.shareExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  this.isPublic = true;
  await this.save();
  return token;
};

wishlistSchema.methods.revokeShareToken = async function () {
  this.shareToken = undefined;
  this.shareExpiresAt = undefined;
  this.isPublic = false;
  await this.save();
  return this;
};

wishlistSchema.methods.isShareTokenValid = function () {
  if (!this.shareToken || !this.shareExpiresAt) return false;
  return Date.now() < this.shareExpiresAt;
};

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

wishlistSchema.virtual("summary").get(function () {
  return {
    itemCount: this.items.length,
    totalEstimatedCost: 0,
    createdAt: this.createdAt,
    lastUpdated: this.updatedAt,
  };
});

wishlistSchema.virtual("itemCount").get(function () {
  return this.items.length;
});

wishlistSchema.virtual("isEmpty").get(function () {
  return this.items.length === 0;
});

wishlistSchema.methods.getRecentlyAdded = function (days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.items.filter((item) => item.addedAt > cutoffDate);
};

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

wishlistSchema.index({ user: 1 }, { unique: true });
wishlistSchema.index({ shareToken: 1 });
wishlistSchema.index({ "items.product": 1 });
wishlistSchema.index({ "items.addedAt": -1 });
wishlistSchema.index({ createdAt: -1 });
wishlistSchema.index({ shareExpiresAt: 1 }, { expireAfterSeconds: 0 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
