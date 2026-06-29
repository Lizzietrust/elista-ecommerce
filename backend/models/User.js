import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
      validate: {
        validator: function (v) {
          return /^\d{10,15}$/.test(v);
        },
        message: "Please add a valid phone number (10-15 digits)",
      },
    },
    addresses: {
      type: Array,
      default: [],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: "United States",
      },
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    defaultPaymentMethod: {
      type: String,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    wishlist: {
      type: Array,
      default: [],
    },
    recentlyViewed: {
      type: Array,
      default: [],
    },

    cart: {
      items: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
            auto: true,
          },
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
          },
          addedAt: {
            type: Number,
            default: Date.now,
          },
          priceAtAdd: {
            type: Number,
            min: 0,
          },
          color: String,
          size: String,
          variantId: String,
          note: String,
        },
      ],
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
      shippingMethod: {
        name: String,
        cost: {
          type: Number,
          default: 0,
        },
        estimatedDelivery: {
          min: Number,
          max: Number,
        },
      },
      taxRate: {
        type: Number,
        default: 0.08,
      },
      currency: {
        type: String,
        default: "USD",
      },
      requiresShipping: {
        type: Boolean,
        default: true,
      },
    },
    preferences: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      currency: {
        type: String,
        default: "USD",
      },
      language: {
        type: String,
        default: "en",
      },
      shippingPreference: {
        type: String,
        enum: ["standard", "express", "economy"],
        default: "standard",
      },
      taxExempt: {
        type: Boolean,
        default: false,
      },
      defaultPaymentMethodType: {
        type: String,
        enum: ["card", "bank_transfer"],
        default: "card",
      },
      savePaymentMethods: {
        type: Boolean,
        default: true,
      },
      autoSavePaymentMethods: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (
    this.isModified("cart.items") ||
    this.isModified("cart.coupon") ||
    this.isModified("cart.couponCode") ||
    this.isModified("cart.discountAmount") ||
    this.isModified("cart.shippingMethod") ||
    this.isModified("cart.taxRate")
  ) {
    this.cart.updatedAt = Date.now();
  }

  if (this.isModified("addresses")) {
    const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);
    if (defaultAddresses.length > 1) {
      let foundFirst = false;
      this.addresses.forEach((addr) => {
        if (addr.isDefault) {
          if (!foundFirst) foundFirst = true;
          else addr.isDefault = false;
        }
      });
    }
    if (defaultAddresses.length === 0 && this.addresses.length > 0) {
      this.addresses[0].isDefault = true;
    }
  }

  if (this.isModified("cart.items")) {
    const Product = mongoose.model("Product");
    for (const item of this.cart.items) {
      if (!item.priceAtAdd && item.product) {
        const product = await Product.findById(item.product).select("price");
        if (product) item.priceAtAdd = product.price;
      }
    }
  }
});

userSchema.virtual("fullName").get(function () {
  return this.name;
});

userSchema.virtual("cartItemCount").get(function () {
  return (this.cart?.items || []).reduce(
    (total, item) => total + (item.quantity || 0),
    0,
  );
});

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "30d" },
  );
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.emailVerificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
  return verificationToken;
};

userSchema.methods.setStripeCustomerId = function (customerId) {
  this.stripeCustomerId = customerId;
  return this.save();
};

userSchema.methods.setDefaultPaymentMethod = function (paymentMethodId) {
  this.defaultPaymentMethod = paymentMethodId;
  return this.save();
};

userSchema.methods.clearDefaultPaymentMethod = function () {
  this.defaultPaymentMethod = null;
  return this.save();
};

userSchema.methods.addToWishlist = function (productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
  }
  return this.save();
};

userSchema.methods.removeFromWishlist = function (productId) {
  this.wishlist = this.wishlist.filter(
    (id) => id?.toString() !== productId?.toString(),
  );
  return this.save();
};

userSchema.methods.isInWishlist = function (productId) {
  return this.wishlist.some((id) => id?.toString() === productId?.toString());
};

userSchema.methods.addToRecentlyViewed = async function (productId) {
  this.recentlyViewed = this.recentlyViewed.filter(
    (id) => id?.toString() !== productId?.toString(),
  );
  this.recentlyViewed.unshift(productId);
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }
  await this.save();
  return this;
};

userSchema.methods.addToCart = async function (
  productId,
  quantity = 1,
  options = {},
) {
  const { color, size, variantId, note } = options;
  const Product = mongoose.model("Product");
  const product = await Product.findById(productId).select("price");
  if (!product) throw new Error("Product not found");

  const existingItemIndex = this.cart.items.findIndex((item) => {
    return (
      item.product?.toString() === productId?.toString() &&
      item.color === color &&
      item.size === size
    );
  });

  if (existingItemIndex >= 0) {
    this.cart.items[existingItemIndex].quantity += quantity;
    this.cart.items[existingItemIndex].addedAt = Date.now();
    if (note) this.cart.items[existingItemIndex].note = note;
  } else {
    const newItem = {
      product: productId,
      quantity,
      addedAt: Date.now(),
      priceAtAdd: product.price,
    };
    if (color) newItem.color = color;
    if (size) newItem.size = size;
    if (variantId) newItem.variantId = variantId;
    if (note) newItem.note = note;
    this.cart.items.push(newItem);
  }

  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.updateCartItemQuantity = function (itemId, quantity) {
  const itemIndex = this.cart.items.findIndex(
    (item) => item._id?.toString() === itemId?.toString(),
  );
  if (itemIndex === -1) throw new Error("Item not found in cart");

  if (quantity <= 0) {
    this.cart.items.splice(itemIndex, 1);
  } else {
    this.cart.items[itemIndex].quantity = quantity;
    this.cart.items[itemIndex].addedAt = Date.now();
  }
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.removeFromCart = function (itemId) {
  const itemIndex = this.cart.items.findIndex(
    (item) => item._id?.toString() === itemId?.toString(),
  );
  if (itemIndex === -1) throw new Error("Item not found in cart");
  this.cart.items.splice(itemIndex, 1);
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];
  this.cart.coupon = null;
  this.cart.couponCode = null;
  this.cart.discountAmount = 0;
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = Date.now();
  return this.save();
};

userSchema.methods.addAddress = function (addressData) {
  this.addresses.push(addressData);
  return this.save();
};

userSchema.methods.updateAddress = function (addressId, updateData) {
  const addressIndex = this.addresses.findIndex(
    (addr) => addr._id?.toString() === addressId?.toString(),
  );
  if (addressIndex === -1) throw new Error("Address not found");

  this.addresses[addressIndex] = {
    ...this.addresses[addressIndex],
    ...updateData,
  };
  return this.save();
};

userSchema.methods.deleteAddress = function (addressId) {
  const addressIndex = this.addresses.findIndex(
    (addr) => addr._id?.toString() === addressId?.toString(),
  );
  if (addressIndex === -1) throw new Error("Address not found");

  this.addresses.splice(addressIndex, 1);
  return this.save();
};

userSchema.methods.setDefaultAddress = function (addressId) {
  this.addresses.forEach((addr) => {
    addr.isDefault = addr._id?.toString() === addressId?.toString();
  });
  return this.save();
};

userSchema.methods.getDefaultAddress = function () {
  return (
    this.addresses.find((addr) => addr.isDefault) || this.addresses[0] || null
  );
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};

userSchema.statics.findInactiveUsers = function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.find({ lastLogin: { $lt: cutoffDate }, isActive: true });
};

userSchema.statics.findUsersWithCarts = function () {
  return this.find({ "cart.items.0": { $exists: true } }).select(
    "name email cart",
  );
};

userSchema.statics.cleanupOldCarts = async function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const result = await this.updateMany(
    {
      "cart.updatedAt": { $lt: cutoffDate },
      "cart.items.0": { $exists: true },
    },
    {
      $set: {
        "cart.items": [],
        "cart.coupon": null,
        "cart.couponCode": null,
        "cart.discountAmount": 0,
        "cart.updatedAt": new Date(),
      },
    },
  );
  return {
    modifiedCount: result.modifiedCount,
    message: `Cleaned up ${result.modifiedCount} old carts`,
  };
};

userSchema.statics.findUsersWithStripe = function () {
  return this.find({
    stripeCustomerId: { $exists: true, $ne: null },
  }).select("name email stripeCustomerId");
};

userSchema.statics.findUsersWithoutStripe = function () {
  return this.find({
    $or: [{ stripeCustomerId: { $exists: false } }, { stripeCustomerId: null }],
  }).select("name email");
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ stripeCustomerId: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);

export default User;
