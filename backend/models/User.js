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

    // Payment integration fields
    stripeCustomerId: {
      type: String,
      unique: true,
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
          color: {
            type: String,
            trim: true,
          },
          size: {
            type: String,
            trim: true,
          },
          variantId: {
            type: mongoose.Schema.Types.ObjectId,
          },
          priceAtAdd: {
            type: Number,
            min: [0, "Price cannot be negative"],
          },
          note: {
            type: String,
            trim: true,
            maxlength: [200, "Note cannot exceed 200 characters"],
          },
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
      couponCode: {
        type: String,
        uppercase: true,
        trim: true,
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: [0, "Discount amount cannot be negative"],
      },
      shippingMethod: {
        name: String,
        cost: {
          type: Number,
          default: 0,
          min: [0, "Shipping cost cannot be negative"],
        },
        estimatedDelivery: {
          min: Number,
          max: Number,
        },
      },
      taxRate: {
        type: Number,
        default: 0.08,
        min: [0, "Tax rate cannot be negative"],
        max: [1, "Tax rate cannot exceed 100%"],
      },
      currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500, "Cart notes cannot exceed 500 characters"],
      },
      requiresShipping: {
        type: Boolean,
        default: true,
      },
      lastValidatedAt: Date,
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
        enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
      },
      language: {
        type: String,
        default: "en",
        enum: ["en", "es", "fr", "de", "zh"],
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

// ===========================
// HELPER FUNCTIONS
// ===========================

const calculateDiscount = (subtotal, coupon) => {
  let discount = 0;
  switch (coupon.discountType) {
    case "percentage":
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
      break;
    case "fixed":
      discount = coupon.discountValue;
      if (discount > subtotal) discount = subtotal;
      break;
    case "free_shipping":
      discount = 0;
      break;
  }
  return discount;
};

const calculateShipping = (cartItems, shippingAddress = null) => {
  const subtotal = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
  if (subtotal > 50) return 0;
  return 5.99;
};

const calculateTax = (amount, shippingAddress = null) => {
  return amount * 0.08;
};

// ===========================
// VIRTUAL PROPERTIES
// ===========================

userSchema.virtual("fullName").get(function () {
  return this.name;
});

userSchema.virtual("defaultAddress").get(function () {
  return (
    this.addresses.find((addr) => addr.isDefault) ||
    (this.addresses.length > 0 ? this.addresses[0] : null) ||
    this.address
  );
});

userSchema.virtual("cartItemCount").get(function () {
  return this.cart.items.reduce((total, item) => total + item.quantity, 0);
});

userSchema.virtual("cartTotal").get(function () {
  if (!this.cart.items || this.cart.items.length === 0) return 0;
  return this.cart.items.reduce((total, item) => {
    if (item.product && item.product.price) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);
});

userSchema.virtual("addressCount").get(function () {
  return this.addresses.length;
});

userSchema.virtual("cartSubtotal").get(async function () {
  if (this.cart.items.length === 0) return 0;
  if (
    !this.cart.items[0].product ||
    typeof this.cart.items[0].product === "string"
  ) {
    await this.populate({
      path: "cart.items.product",
      select: "price isActive",
    });
  }
  return this.cart.items.reduce((total, item) => {
    if (item.product && item.product.isActive) {
      const itemPrice = item.priceAtAdd || item.product.price;
      return total + itemPrice * item.quantity;
    }
    return total;
  }, 0);
});

userSchema.virtual("cartTaxAmount").get(async function () {
  const subtotal = await this.cartSubtotal;
  const discount = this.cart.discountAmount || 0;
  const shipping = this.cart.shippingMethod?.cost || 0;
  const taxableAmount = subtotal - discount + shipping;
  return taxableAmount * (this.cart.taxRate || 0.08);
});

userSchema.virtual("cartTotalAmount").get(async function () {
  const subtotal = await this.cartSubtotal;
  const discount = this.cart.discountAmount || 0;
  const shipping = this.cart.shippingMethod?.cost || 0;
  const tax = await this.cartTaxAmount;
  return subtotal - discount + shipping + tax;
});

userSchema.virtual("hasStripeCustomer").get(function () {
  return !!this.stripeCustomerId;
});

userSchema.virtual("paymentMethodsCount").get(function () {
  return this.defaultPaymentMethod ? 1 : 0;
});

// ===========================
// MIDDLEWARE — all async, no duplicates
// ===========================

// 1. Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 2. Update cart updatedAt timestamp
userSchema.pre("save", async function (next) {
  try {
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
    next();
  } catch (err) {
    next(err);
  }
});

// 3. Ensure only one default address
userSchema.pre("save", async function (next) {
  try {
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
    next();
  } catch (err) {
    next(err);
  }
});

// 4. Store product price at time of adding to cart
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("cart.items")) {
      const Product = mongoose.model("Product");
      for (const item of this.cart.items) {
        if (!item.priceAtAdd && item.product) {
          const product = await Product.findById(item.product).select("price");
          if (product) item.priceAtAdd = product.price;
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

// ===========================
// INSTANCE METHODS
// ===========================

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE },
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
    (id) => id.toString() !== productId.toString(),
  );
  return this.save();
};

userSchema.methods.isInWishlist = function (productId) {
  return this.wishlist.some((id) => id.toString() === productId.toString());
};

userSchema.methods.addToRecentlyViewed = function (productId) {
  this.recentlyViewed = this.recentlyViewed.filter(
    (id) => id.toString() !== productId.toString(),
  );
  this.recentlyViewed.unshift(productId);
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }
  return this.save();
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
      item.product.toString() === productId.toString() &&
      item.color === color &&
      item.size === size &&
      (item.variantId
        ? item.variantId.toString() === (variantId || "").toString()
        : !variantId)
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
    (item) => item._id.toString() === itemId.toString(),
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

userSchema.methods.updateCartItemAttributes = function (itemId, updates) {
  const itemIndex = this.cart.items.findIndex(
    (item) => item._id.toString() === itemId.toString(),
  );
  if (itemIndex === -1) throw new Error("Item not found in cart");

  const item = this.cart.items[itemIndex];
  if (updates.color !== undefined) item.color = updates.color;
  if (updates.size !== undefined) item.size = updates.size;
  if (updates.variantId !== undefined) item.variantId = updates.variantId;
  if (updates.note !== undefined) item.note = updates.note;
  if (updates.quantity !== undefined && updates.quantity > 0) {
    item.quantity = updates.quantity;
  }
  item.addedAt = Date.now();
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.removeFromCart = function (itemId) {
  const itemIndex = this.cart.items.findIndex(
    (item) => item._id.toString() === itemId.toString(),
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

userSchema.methods.isInCart = function (productId, options = {}) {
  const { color, size, variantId } = options;
  return this.cart.items.some((item) => {
    const productMatch = item.product.toString() === productId.toString();
    const colorMatch = color ? item.color === color : true;
    const sizeMatch = size ? item.size === size : true;
    const variantMatch = variantId
      ? item.variantId
        ? item.variantId.toString() === variantId.toString()
        : false
      : true;
    return productMatch && colorMatch && sizeMatch && variantMatch;
  });
};

userSchema.methods.applyCouponToCart = async function (coupon) {
  this.cart.coupon = coupon._id;
  this.cart.couponCode = coupon.code;
  const subtotal = await this.cartSubtotal;
  this.cart.discountAmount = calculateDiscount(subtotal, coupon);
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.removeCouponFromCart = function () {
  this.cart.coupon = null;
  this.cart.couponCode = null;
  this.cart.discountAmount = 0;
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.setShippingMethod = function (shippingMethod) {
  this.cart.shippingMethod = shippingMethod;
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.setTaxRate = function (taxRate) {
  this.cart.taxRate = taxRate;
  this.cart.updatedAt = Date.now();
  return this.save();
};

userSchema.methods.getCartSummary = async function (shippingAddress = null) {
  await this.populate({
    path: "cart.items.product",
    select: "name price images stock isActive weight sku",
  });

  const validCartItems = this.cart.items.filter(
    (item) => item.product && item.product.isActive,
  );

  const subtotal = validCartItems.reduce((total, item) => {
    const itemPrice = item.priceAtAdd || item.product.price;
    return total + itemPrice * item.quantity;
  }, 0);

  let couponDetails = null;
  if (this.cart.coupon) {
    const Coupon = mongoose.model("Coupon");
    const coupon = await Coupon.findById(this.cart.coupon);
    if (coupon && coupon.isActive) {
      couponDetails = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        description: coupon.description,
      };
    }
  }

  const shippingCost =
    this.cart.shippingMethod?.cost ||
    calculateShipping(validCartItems, shippingAddress);

  const taxableAmount =
    subtotal - (this.cart.discountAmount || 0) + shippingCost;
  const taxRate = this.preferences.taxExempt ? 0 : this.cart.taxRate || 0.08;
  const tax = taxableAmount * taxRate;
  const total = subtotal - (this.cart.discountAmount || 0) + shippingCost + tax;

  return {
    items: validCartItems.map((item) => ({
      _id: item._id,
      product: {
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        images: item.product.images,
        stock: item.product.stock,
        sku: item.product.sku,
      },
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      variantId: item.variantId,
      note: item.note,
      priceAtAdd: item.priceAtAdd,
      addedAt: item.addedAt,
      subtotal: (item.priceAtAdd || item.product.price) * item.quantity,
    })),
    summary: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat((this.cart.discountAmount || 0).toFixed(2)),
      shipping: parseFloat(shippingCost.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: validCartItems.reduce((sum, item) => sum + item.quantity, 0),
      productCount: validCartItems.length,
      coupon: couponDetails,
      shippingMethod: this.cart.shippingMethod,
      taxRate: taxRate,
      currency: this.cart.currency || this.preferences.currency,
      requiresShipping: this.cart.requiresShipping,
      notes: this.cart.notes,
    },
  };
};

userSchema.methods.validateCart = async function () {
  await this.populate({
    path: "cart.items.product",
    select: "name price stock isActive sku weight dimensions",
  });

  const validationResults = {
    isValid: true,
    errors: [],
    warnings: [],
    items: [],
    requiresShipping: false,
    totalWeight: 0,
  };

  for (const item of this.cart.items) {
    const product = item.product;
    const itemResult = {
      _id: item._id,
      product: product?._id,
      name: product?.name || "Unknown Product",
      requestedQuantity: item.quantity,
      availableQuantity: product?.stock || 0,
      price: item.priceAtAdd || product?.price || 0,
      isAvailable: true,
      message: "",
      requiresShipping: true,
    };

    if (!product || !product.isActive) {
      itemResult.isAvailable = false;
      itemResult.message = "Product is no longer available";
      validationResults.errors.push(itemResult);
    } else if (item.quantity > product.stock) {
      itemResult.isAvailable = false;
      itemResult.message = `Only ${product.stock} items available`;
      validationResults.warnings.push(itemResult);
    } else {
      itemResult.message = "Available";
      validationResults.items.push(itemResult);
      if (product.weight && product.weight.value) {
        validationResults.totalWeight += product.weight.value * item.quantity;
      }
      if (product.weight && product.weight.value > 0) {
        validationResults.requiresShipping = true;
      }
    }
  }

  validationResults.isValid = validationResults.errors.length === 0;
  this.cart.requiresShipping = validationResults.requiresShipping;
  this.cart.lastValidatedAt = new Date();
  await this.save();

  return validationResults;
};

userSchema.methods.mergeCart = async function (guestCartItems) {
  for (const guestItem of guestCartItems) {
    const { productId, quantity = 1, color, size, variantId, note } = guestItem;
    const Product = mongoose.model("Product");
    const product = await Product.findById(productId);
    if (!product || !product.isActive) continue;
    await this.addToCart(productId, quantity, { color, size, variantId, note });
  }
  return this.save();
};

userSchema.methods.cartToOrderItems = async function () {
  await this.populate({
    path: "cart.items.product",
    select: "name price sku",
  });
  return this.cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    sku: item.product.sku,
    quantity: item.quantity,
    price: item.priceAtAdd || item.product.price,
    color: item.color,
    size: item.size,
    variantId: item.variantId,
    note: item.note,
    requiresShipping: this.cart.requiresShipping,
  }));
};

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = Date.now();
  return this.save();
};

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

  if (isDefault) {
    this.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  this.addresses.push(newAddress);

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

userSchema.methods.updateAddress = function (addressId, updateData) {
  const address = this.addresses.id(addressId);
  if (!address) throw new Error("Address not found");

  Object.keys(updateData).forEach((key) => {
    if (key !== "isDefault" && updateData[key] !== undefined) {
      address[key] = updateData[key];
    }
  });

  if (updateData.isDefault === true) {
    this.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });
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

userSchema.methods.deleteAddress = function (addressId) {
  const addressIndex = this.addresses.findIndex(
    (addr) => addr._id.toString() === addressId,
  );
  if (addressIndex === -1) throw new Error("Address not found");

  const wasDefault = this.addresses[addressIndex].isDefault;
  this.addresses.splice(addressIndex, 1);

  if (wasDefault && this.addresses.length > 0) {
    this.addresses[0].isDefault = true;
    const newDefault = this.addresses[0];
    this.address = {
      street: newDefault.street,
      city: newDefault.city,
      state: newDefault.state,
      zipCode: newDefault.zipCode,
      country: newDefault.country,
    };
  }

  if (this.addresses.length === 0) this.address = {};

  return this.save();
};

userSchema.methods.setDefaultAddress = function (addressId) {
  this.addresses.forEach((address) => {
    const isDefault = address._id.toString() === addressId;
    address.isDefault = isDefault;
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

userSchema.methods.getDefaultAddress = function () {
  const defaultAddress = this.addresses.find((addr) => addr.isDefault);
  return (
    defaultAddress || (this.addresses.length > 0 ? this.addresses[0] : null)
  );
};

userSchema.methods.migrateLegacyAddress = function () {
  if (this.address && this.address.street && this.addresses.length === 0) {
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

// ===========================
// STATIC METHODS
// ===========================

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

// ===========================
// INDEXES
// ===========================

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ "addresses.isDefault": 1 });
userSchema.index({ "cart.updatedAt": -1 });
userSchema.index({ "cart.couponCode": 1 });
userSchema.index({ "cart.items.product": 1 });
userSchema.index({ wishlist: 1 });
userSchema.index({ recentlyViewed: 1 });
userSchema.index({ stripeCustomerId: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);

export default User;
