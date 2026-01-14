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
  }
);

// Check if coupon is valid
couponSchema.methods.isValid = function () {
  const now = new Date();

  if (!this.isActive) return false;
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;

  return true;
};

// Increment usage count
couponSchema.methods.incrementUsage = function () {
  this.usedCount += 1;
  return this.save();
};

// Check if user can use this coupon
couponSchema.methods.canUserUse = async function (userId) {
  if (this.perUserLimit) {
    const Order = mongoose.model("Order");
    const userUsageCount = await Order.countDocuments({
      user: userId,
      "coupon.code": this.code,
    });
    return userUsageCount < this.perUserLimit;
  }
  return true;
};

// Get discount amount for a given subtotal
couponSchema.methods.getDiscountAmount = function (subtotal) {
  switch (this.discountType) {
    case "percentage":
      let discount = (subtotal * this.discountValue) / 100;
      if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
        discount = this.maxDiscountAmount;
      }
      return discount;

    case "fixed":
      return Math.min(this.discountValue, subtotal);

    case "free_shipping":
      return 0; // This is handled separately in shipping calculation

    default:
      return 0;
  }
};

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
