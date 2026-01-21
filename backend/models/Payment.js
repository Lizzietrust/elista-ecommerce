import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["stripe", "credit_card", "cod", "bank_transfer"],
      default: "stripe",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "usd",
      uppercase: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "requires_payment_method",
        "requires_confirmation",
        "requires_action",
        "processing",
        "requires_capture",
        "succeeded",
        "failed",
        "canceled",
        "refunded",
      ],
      default: "pending",
    },
    
    // Stripe specific fields
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    checkoutSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // Transaction details
    transactionId: {
      type: String,
    },
    capturedAt: {
      type: Date,
    },
    
    // Refund details
    refunded: {
      type: Boolean,
      default: false,
    },
    refundId: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundReason: {
      type: String,
    },
    
    // Error information
    error: {
      code: String,
      message: String,
      decline_code: String,
    },
    
    // Metadata for tracking
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Customer details (optional)
    customerEmail: {
      type: String,
    },
    customerName: {
      type: String,
    },

    // Billing address
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ paymentIntentId: 1 }, { sparse: true });
paymentSchema.index({ checkoutSessionId: 1 }, { sparse: true });
paymentSchema.index({ transactionId: 1 }, { sparse: true });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ refunded: 1 });
paymentSchema.index({ customerEmail: 1 });

// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function () {
  return `$${this.amount.toFixed(2)}`;
});

// Virtual for formatted status
paymentSchema.virtual("formattedStatus").get(function () {
  return this.status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
});

// Virtual for payment method display name
paymentSchema.virtual("paymentMethodDisplay").get(function () {
  const methods = {
    stripe: "Credit Card",
    credit_card: "Credit Card",
    cod: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
  };
  return methods[this.paymentMethod] || this.paymentMethod;
});

// Virtual for isSuccessful
paymentSchema.virtual("isSuccessful").get(function () {
  return this.status === "succeeded" && !this.refunded;
});

// Virtual for canRefund
paymentSchema.virtual("canRefund").get(function () {
  return this.status === "succeeded" && !this.refunded;
});

// Virtual for formatted captured date
paymentSchema.virtual("formattedCapturedAt").get(function () {
  if (!this.capturedAt) return null;
  return this.capturedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Pre-save middleware
paymentSchema.pre("save", function (next) {
  // Update refund amount if not specified but refunded
  if (this.refunded && !this.refundAmount) {
    this.refundAmount = this.amount;
  }

  // Set customer details if not set
  if (!this.customerEmail && this.user && this.user.email) {
    this.customerEmail = this.user.email;
  }

  if (!this.customerName && this.user && this.user.name) {
    this.customerName = this.user.name;
  }

  // Update capturedAt when status changes to succeeded
  if (this.isModified("status") && this.status === "succeeded" && !this.capturedAt) {
    this.capturedAt = new Date();
  }

  next();
});

// Static method to get successful payments for user
paymentSchema.statics.getSuccessfulPayments = function (userId, limit = 10) {
  return this.find({
    user: userId,
    status: "succeeded",
    refunded: { $ne: true },
  })
    .populate("order", "orderNumber totalPrice orderStatus")
    .sort({ capturedAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get recent payments
paymentSchema.statics.getRecentPayments = function (limit = 20) {
  return this.find({})
    .populate("user", "name email")
    .populate("order", "orderNumber totalPrice")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get payment analytics
paymentSchema.statics.getPaymentAnalytics = async function (startDate, endDate) {
  const matchStage = {
    createdAt: { $gte: startDate, $lte: endDate },
    status: "succeeded",
  };

  const analytics = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          paymentMethod: "$paymentMethod",
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
      },
    },
    { $sort: { "_id.date": -1 } },
  ]);

  return analytics;
};

// Static method to get payment summary
paymentSchema.statics.getPaymentSummary = async function (userId) {
  const summary = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$status",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return summary;
};

// Static method to find payment by paymentIntentId
paymentSchema.statics.findByPaymentIntentId = function (paymentIntentId) {
  return this.findOne({ paymentIntentId })
    .populate("user", "name email")
    .populate("order");
};

// Static method to find payment by checkoutSessionId
paymentSchema.statics.findByCheckoutSessionId = function (checkoutSessionId) {
  return this.findOne({ checkoutSessionId })
    .populate("user", "name email")
    .populate("order");
};

// Instance method to mark as refunded
paymentSchema.methods.markAsRefunded = function (refundId, refundAmount, reason) {
  this.refunded = true;
  this.refundId = refundId;
  this.refundAmount = refundAmount || this.amount;
  this.refundReason = reason;
  this.refundedAt = new Date();
  this.status = "refunded";
  return this.save();
};

// Instance method to update status
paymentSchema.methods.updateStatus = function (newStatus, error = null) {
  this.status = newStatus;
  
  if (error) {
    this.error = {
      message: error.message,
      code: error.code,
      decline_code: error.decline_code,
    };
  }

  if (newStatus === "succeeded" && !this.capturedAt) {
    this.capturedAt = new Date();
  }

  return this.save();
};

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;