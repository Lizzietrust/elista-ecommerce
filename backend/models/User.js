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
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
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
      default: false,
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
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        maxlength: 20,
      },
    ],
    cart: {
      items: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            default: 1,
            min: 1,
          },
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      updatedAt: {
        type: Date,
        default: Date.now,
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
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return this.name;
});

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt timestamp for cart
userSchema.pre("save", function (next) {
  if (this.isModified("cart.items")) {
    this.cart.updatedAt = Date.now();
  }
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get reset password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Method to get email verification token
userSchema.methods.getEmailVerificationToken = function () {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set expire (24 hours)
  this.emailVerificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

// Method to add product to wishlist
userSchema.methods.addToWishlist = function (productId) {
  if (!this.wishlist.includes(productId)) {
    this.wishlist.push(productId);
  }
  return this.save();
};

// Method to remove product from wishlist
userSchema.methods.removeFromWishlist = function (productId) {
  this.wishlist = this.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  );
  return this.save();
};

// Method to add to recently viewed
userSchema.methods.addToRecentlyViewed = function (productId) {
  // Remove if already exists
  this.recentlyViewed = this.recentlyViewed.filter(
    (id) => id.toString() !== productId.toString()
  );

  // Add to beginning
  this.recentlyViewed.unshift(productId);

  // Keep only last 20 items
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }

  return this.save();
};

// Method to add item to cart
userSchema.methods.addToCart = function (productId, quantity = 1) {
  const cartItemIndex = this.cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (cartItemIndex >= 0) {
    // Update quantity if product already in cart
    this.cart.items[cartItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    this.cart.items.push({
      product: productId,
      quantity: quantity,
      addedAt: Date.now(),
    });
  }

  this.cart.updatedAt = Date.now();
  return this.save();
};

// Method to update cart item quantity
userSchema.methods.updateCartItemQuantity = function (productId, quantity) {
  const cartItemIndex = this.cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (cartItemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      this.cart.items.splice(cartItemIndex, 1);
    } else {
      // Update quantity
      this.cart.items[cartItemIndex].quantity = quantity;
    }
    this.cart.updatedAt = Date.now();
    return this.save();
  }
  return this;
};

// Method to remove item from cart
userSchema.methods.removeFromCart = function (productId) {
  this.cart.items = this.cart.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );
  this.cart.updatedAt = Date.now();
  return this.save();
};

// Method to clear cart
userSchema.methods.clearCart = function () {
  this.cart.items = [];
  this.cart.updatedAt = Date.now();
  return this.save();
};

// Method to check if product is in wishlist
userSchema.methods.isInWishlist = function (productId) {
  return this.wishlist.some((id) => id.toString() === productId.toString());
};

// Method to check if product is in cart
userSchema.methods.isInCart = function (productId) {
  return this.cart.items.some(
    (item) => item.product.toString() === productId.toString()
  );
};

// Method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = Date.now();
  return this.save();
};

// Static method to find user by email for login
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for user's cart item count
userSchema.virtual("cartItemCount").get(function () {
  return this.cart.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for user's cart total (requires populated cart items)
userSchema.virtual("cartTotal").get(function () {
  if (!this.cart.items || this.cart.items.length === 0) return 0;

  // This requires cart items to be populated with product prices
  return this.cart.items.reduce((total, item) => {
    if (item.product && item.product.price) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);
});

const User = mongoose.model("User", userSchema);

export default User;
