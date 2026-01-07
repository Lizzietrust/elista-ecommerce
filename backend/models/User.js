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

    // Multiple addresses support
    addresses: [
      {
        street: {
          type: String,
          required: [true, "Please provide street address"],
        },
        city: {
          type: String,
          required: [true, "Please provide city"],
        },
        state: {
          type: String,
          required: [true, "Please provide state"],
        },
        zipCode: {
          type: String,
          required: [true, "Please provide zip code"],
        },
        country: {
          type: String,
          required: [true, "Please provide country"],
          default: "United States",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        addressType: {
          type: String,
          enum: ["home", "work", "other"],
          default: "home",
        },
        phone: {
          type: String,
          validate: {
            validator: function (v) {
              return !v || /^\d{10,15}$/.test(v);
            },
            message: "Please add a valid phone number (10-15 digits)",
          },
        },
        fullName: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Keep backward compatibility with single address field
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

// Virtual for default address
userSchema.virtual("defaultAddress").get(function () {
  return (
    this.addresses.find((addr) => addr.isDefault) ||
    (this.addresses.length > 0 ? this.addresses[0] : null) ||
    this.address
  );
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

// Middleware to ensure only one default address
userSchema.pre("save", function (next) {
  if (this.isModified("addresses")) {
    // Count default addresses
    const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);

    // If more than one default, make only the first one default
    if (defaultAddresses.length > 1) {
      let foundFirst = false;
      this.addresses.forEach((addr) => {
        if (addr.isDefault) {
          if (!foundFirst) {
            foundFirst = true;
          } else {
            addr.isDefault = false;
          }
        }
      });
    }

    // If no default address and we have addresses, set first as default
    if (defaultAddresses.length === 0 && this.addresses.length > 0) {
      this.addresses[0].isDefault = true;
    }
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

// === ADDRESS MANAGEMENT METHODS ===

// Method to add address
userSchema.methods.addAddress = function (addressData) {
  const {
    street,
    city,
    state,
    zipCode,
    country,
    addressType,
    isDefault,
    phone,
    fullName,
  } = addressData;

  const newAddress = {
    street,
    city,
    state,
    zipCode,
    country: country || "United States",
    addressType: addressType || "home",
    isDefault: isDefault || false,
    phone: phone || this.phone,
    fullName: fullName || this.name,
    createdAt: Date.now(),
  };

  // If setting as default, update all addresses to non-default
  if (isDefault) {
    this.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  this.addresses.push(newAddress);

  // If this is the first address or it's set as default, update the legacy address field
  if (this.addresses.length === 1 || isDefault) {
    this.address = {
      street,
      city,
      state,
      zipCode,
      country: country || "United States",
    };
  }

  return this.save();
};

// Method to update address
userSchema.methods.updateAddress = function (addressId, updateData) {
  const address = this.addresses.id(addressId);

  if (!address) {
    throw new Error("Address not found");
  }

  // Update fields
  Object.keys(updateData).forEach((key) => {
    if (key !== "isDefault" && updateData[key] !== undefined) {
      address[key] = updateData[key];
    }
  });

  // Handle default address change
  if (updateData.isDefault === true) {
    this.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    // Update legacy address field if this becomes default
    this.address = {
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    };
  }

  return this.save();
};

// Method to delete address
userSchema.methods.deleteAddress = function (addressId) {
  const addressIndex = this.addresses.findIndex(
    (addr) => addr._id.toString() === addressId
  );

  if (addressIndex === -1) {
    throw new Error("Address not found");
  }

  const wasDefault = this.addresses[addressIndex].isDefault;

  this.addresses.splice(addressIndex, 1);

  // If default address was deleted, set first address as default
  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;

    // Update legacy address field with new default
    const newDefault = this.addresses[0];
    this.address = {
      street: newDefault.street,
      city: newDefault.city,
      state: newDefault.state,
      zipCode: newDefault.zipCode,
      country: newDefault.country,
    };
  }

  // If no addresses left, clear legacy address field
  if (this.addresses.length === 0) {
    this.address = {};
  }

  return this.save();
};

// Method to set default address
userSchema.methods.setDefaultAddress = function (addressId) {
  this.addresses.forEach((address) => {
    const isDefault = address._id.toString() === addressId;
    address.isDefault = isDefault;

    // Update legacy address field if this is default
    if (isDefault) {
      this.address = {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      };
    }
  });

  return this.save();
};

// Method to get default address
userSchema.methods.getDefaultAddress = function () {
  const defaultAddress = this.addresses.find((addr) => addr.isDefault);
  return (
    defaultAddress || (this.addresses.length > 0 ? this.addresses[0] : null)
  );
};

// Method to migrate legacy address to addresses array (for existing users)
userSchema.methods.migrateLegacyAddress = function () {
  if (this.address && this.address.street && this.addresses.length === 0) {
    // Create address from legacy field
    const legacyAddress = {
      street: this.address.street,
      city: this.address.city,
      state: this.address.state,
      zipCode: this.address.zipCode,
      country: this.address.country || "United States",
      addressType: "home",
      isDefault: true,
      phone: this.phone,
      fullName: this.name,
      createdAt: Date.now(),
    };

    this.addresses.push(legacyAddress);
    return this.save();
  }
  return Promise.resolve(this);
};

// === END ADDRESS MANAGEMENT METHODS ===

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

// Virtual for user's active addresses count
userSchema.virtual("addressCount").get(function () {
  return this.addresses.length;
});

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};

// Static method to find inactive users
userSchema.statics.findInactiveUsers = function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    lastLogin: { $lt: cutoffDate },
    isActive: true,
  });
};

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ "addresses.isDefault": 1 });

const User = mongoose.model("User", userSchema);

export default User;
