import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please provide coupon code"],
      uppercase: true,
      unique: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping"],
      required: [true, "Please provide discount type"],
    },
    discountValue: {
      type: Number,
      required: [true, "Please provide discount value"],
      min: [0, "Discount value cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, "Max discount amount cannot be negative"],
    },
    minPurchaseAmount: {
      type: Number,
      min: [0, "Minimum purchase amount cannot be negative"],
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
    },
    usageLimit: {
      type: Number,
      min: [0, "Usage limit cannot be negative"],
    },
    perUserLimit: {
      type: Number,
      min: [0, "Per user limit cannot be negative"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ validUntil: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ createdBy: 1 });

couponSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validUntil > now &&
    (!this.validFrom || this.validFrom <= now) &&
    (!this.usageLimit || this.usedCount < this.usageLimit)
  );
});

couponSchema.methods.isValidCoupon = function () {
  const now = new Date();

  if (!this.isActive) return false;
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;

  return true;
};

couponSchema.methods.isValidForAmount = function (subtotal) {
  if (!this.isValidCoupon()) return false;

  if (this.minPurchaseAmount && subtotal < this.minPurchaseAmount) {
    return false;
  }

  return true;
};

couponSchema.methods.incrementUsage = function () {
  this.usedCount += 1;
  return this.save();
};

couponSchema.methods.canUserUse = async function (userId) {
  if (!this.isValidCoupon()) return false;

  if (this.perUserLimit) {
    const Order = mongoose.model("Order");
    const userUsageCount = await Order.countDocuments({
      user: userId,
      coupon: this._id,
    });
    return userUsageCount < this.perUserLimit;
  }
  return true;
};

couponSchema.methods.appliesToProduct = async function (productId) {
  if (
    (!this.categories || this.categories.length === 0) &&
    (!this.products || this.products.length === 0)
  ) {
    return true;
  }

  if (this.products && this.products.length > 0) {
    const productIds = this.products.map((id) => id.toString());
    if (productIds.includes(productId.toString())) {
      return true;
    }
  }

  if (this.categories && this.categories.length > 0) {
    const Product = mongoose.model("Product");
    const product = await Product.findById(productId).select("category");

    if (product && product.category) {
      const categoryIds = this.categories.map((id) => id.toString());
      if (categoryIds.includes(product.category.toString())) {
        return true;
      }
    }
  }

  return false;
};

couponSchema.methods.getDiscountAmount = function (subtotal) {
  if (!this.isValidCoupon()) return 0;

  if (this.minPurchaseAmount && subtotal < this.minPurchaseAmount) {
    return 0;
  }

  switch (this.discountType) {
    case "percentage":
      let discount = (subtotal * this.discountValue) / 100;
      if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
        discount = this.maxDiscountAmount;
      }
      return Math.max(0, discount);

    case "fixed":
      return Math.min(this.discountValue, Math.max(0, subtotal));

    case "free_shipping":
      return 0;

    default:
      return 0;
  }
};

couponSchema.methods.validateForCart = async function (cartItems) {
  const validation = {
    isValid: false,
    discount: 0,
    message: "",
    appliesToItems: [],
  };

  if (!this.isValidCoupon()) {
    validation.message = "Coupon is not valid";
    return validation;
  }

  let applicableSubtotal = 0;
  const appliesToItems = [];

  for (const item of cartItems) {
    const applies = await this.appliesToProduct(
      item.product._id || item.product,
    );
    if (applies) {
      const itemSubtotal = item.product.price * item.quantity;
      applicableSubtotal += itemSubtotal;
      appliesToItems.push({
        product: item.product._id || item.product,
        name: item.product.name,
        applies: true,
        subtotal: itemSubtotal,
      });
    } else {
      appliesToItems.push({
        product: item.product._id || item.product,
        name: item.product.name,
        applies: false,
        subtotal: 0,
      });
    }
  }

  if (this.minPurchaseAmount && applicableSubtotal < this.minPurchaseAmount) {
    validation.message = `Minimum purchase amount of $${this.minPurchaseAmount} required`;
    validation.appliesToItems = appliesToItems;
    return validation;
  }

  const discount = this.getDiscountAmount(applicableSubtotal);

  validation.isValid = true;
  validation.discount = discount;
  validation.message = "Coupon applied successfully";
  validation.appliesToItems = appliesToItems;
  validation.applicableSubtotal = applicableSubtotal;

  return validation;
};

couponSchema.statics.findValidCoupon = async function (code, userId = null) {
  const coupon = await this.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) return null;

  if (!coupon.isValidCoupon()) return null;

  if (userId && !(await coupon.canUserUse(userId))) {
    return null;
  }

  return coupon;
};

couponSchema.statics.getActiveCoupons = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    validUntil: { $gt: now },
    $or: [{ validFrom: { $exists: false } }, { validFrom: { $lte: now } }],
    $or: [
      { usageLimit: { $exists: false } },
      { usageLimit: 0 },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  }).sort({ validUntil: 1 });
};

couponSchema.statics.getExpiredCoupons = function () {
  const now = new Date();
  return this.find({
    $or: [{ validUntil: { $lt: now } }, { isActive: false }],
  }).sort({ validUntil: -1 });
};

couponSchema.pre("save", function () {
  if (this.code) {
    this.code = this.code.toUpperCase().trim();
  }

  if (this.validFrom && this.validUntil && this.validUntil <= this.validFrom) {
    throw new Error("validUntil must be after validFrom");
    return;
  }

  if (this.discountType === "percentage" && this.discountValue > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
    return;
  }
});

couponSchema.pre("remove", async function () {
  const Order = mongoose.model("Order");
  const orderCount = await Order.countDocuments({ coupon: this._id });

  if (orderCount > 0) {
    throw new Error(
      `Cannot delete coupon. It is being used in ${orderCount} orders.`,
    );
    return;
  }
});

couponSchema.virtual("formattedValidFrom").get(function () {
  return this.validFrom ? this.validFrom.toLocaleDateString() : "Immediately";
});

couponSchema.virtual("formattedValidUntil").get(function () {
  return this.validUntil
    ? this.validUntil.toLocaleDateString()
    : "No expiration";
});

couponSchema.virtual("discountDescription").get(function () {
  switch (this.discountType) {
    case "percentage":
      return `${
        this.discountValue
      }% off${this.maxDiscountAmount ? ` (max $${this.maxDiscountAmount})` : ""}`;
    case "fixed":
      return `$${this.discountValue} off`;
    case "free_shipping":
      return "Free shipping";
    default:
      return "Discount";
  }
});

couponSchema.virtual("remainingUses").get(function () {
  if (!this.usageLimit) return "Unlimited";
  return Math.max(0, this.usageLimit - this.usedCount);
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
