import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
  sku: {
    type: String,
  },
  weight: {
    value: Number,
    unit: String,
  },
});

const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "United States",
  },
  phone: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  company: {
    type: String,
  },
  apartment: {
    type: String,
  },
});

const billingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  country: {
    type: String,
  },
  phone: {
    type: String,
  },
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
});

const paymentResultSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  status: {
    type: String,
  },
  update_time: {
    type: Date,
  },
  email_address: {
    type: String,
  },
  payment_intent: {
    type: String,
  },
  transaction_id: {
    type: String,
  },
  payment_method: {
    type: String,
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ],
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notes: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    billingAddress: {
      type: billingAddressSchema,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["stripe", "cod", "bank_transfer"],
      default: "stripe",
    },
    paymentResult: {
      type: paymentResultSchema,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    items: [orderItemSchema],
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountCode: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "on_hold",
        "returned",
      ],
      default: "pending",
    },
    statusHistory: [statusHistorySchema],
    shippingTracking: {
      type: String,
    },
    shippingCarrier: {
      type: String,
    },
    shippingService: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    customerNotes: {
      type: String,
    },
    internalNotes: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxId: {
      type: String,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    paymentIntentId: {
      type: String,
    },
    checkoutSessionId: {
      type: String,
    },
    fraudCheck: {
      type: String,
      enum: ["pending", "passed", "failed", "review"],
      default: "pending",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    source: {
      type: String,
      enum: ["web", "mobile", "api"],
      default: "web",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Get count of orders for today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const orderCount = await this.constructor.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Format: ORD-YYYYMMDD-XXXX
    this.orderNumber = `ORD-${year}${month}${day}-${String(
      orderCount + 1
    ).padStart(4, "0")}`;
  }

  // Update isPaid and isDelivered flags
  if (this.paymentStatus === "paid" || this.paymentStatus === "partially_refunded") {
    this.isPaid = true;
    if (!this.paidAt) {
      this.paidAt = new Date();
    }
  }

  if (this.orderStatus === "delivered") {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }

  // Set billing address to shipping address if not provided
  if (!this.billingAddress && this.shippingAddress) {
    this.billingAddress = {
      street: this.shippingAddress.street,
      city: this.shippingAddress.city,
      state: this.shippingAddress.state,
      zipCode: this.shippingAddress.zipCode,
      country: this.shippingAddress.country,
      phone: this.shippingAddress.phone,
      fullName: this.shippingAddress.fullName,
      email: this.shippingAddress.email,
    };
  }

  next();
});

// Add status to history when status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("orderStatus") && !this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
    });
  }

  // Add payment status to history when it changes
  if (this.isModified("paymentStatus") && !this.isNew) {
    this.statusHistory.push({
      status: `payment_${this.paymentStatus}`,
      notes: `Payment status changed to ${this.paymentStatus}`,
      timestamp: new Date(),
    });
  }

  next();
});

// Virtual for formatted total price
orderSchema.virtual("formattedTotalPrice").get(function () {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency || 'USD',
  });
  return formatter.format(this.totalPrice);
});

// Virtual for formatted order date
orderSchema.virtual("formattedOrderDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Virtual for formatted estimated delivery
orderSchema.virtual("formattedEstimatedDelivery").get(function () {
  if (!this.estimatedDelivery) return "Not set";
  return this.estimatedDelivery.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for order total items
orderSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for canCancel
orderSchema.virtual("canCancel").get(function () {
  const cancellableStatuses = ["pending", "processing"];
  return cancellableStatuses.includes(this.orderStatus) && !this.isPaid;
});

// Virtual for canReturn
orderSchema.virtual("canReturn").get(function () {
  const returnableStatuses = ["delivered"];
  const daysSinceDelivery = this.deliveredAt 
    ? (new Date() - this.deliveredAt) / (1000 * 60 * 60 * 24)
    : Infinity;
  return returnableStatuses.includes(this.orderStatus) && daysSinceDelivery <= 30; // 30-day return policy
});

// Virtual for order age in days
orderSchema.virtual("ageInDays").get(function () {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Static method to get monthly sales
orderSchema.statics.getMonthlySales = async function (year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lt: endDate },
        orderStatus: { $nin: ["cancelled", "refunded"] },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalSales: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function () {
  const [
    totalOrders,
    totalRevenue,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
  ] = await Promise.all([
    this.countDocuments({}),
    this.aggregate([
      {
        $match: {
          orderStatus: { $nin: ["cancelled", "refunded"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]),
    this.countDocuments({ orderStatus: "pending" }),
    this.countDocuments({ orderStatus: "processing" }),
    this.countDocuments({ orderStatus: "delivered" }),
    this.countDocuments({ orderStatus: "cancelled" }),
  ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
  };
};

// Static method to find order by payment intent
orderSchema.statics.findByPaymentIntentId = function (paymentIntentId) {
  return this.findOne({ paymentIntentId })
    .populate("user", "name email")
    .populate("items.product", "name images");
};

// Static method to find order by checkout session
orderSchema.statics.findByCheckoutSessionId = function (checkoutSessionId) {
  return this.findOne({ checkoutSessionId })
    .populate("user", "name email")
    .populate("items.product", "name images");
};

// Static method to get user orders
orderSchema.statics.getUserOrders = function (userId, limit = 10, page = 1) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("items.product", "name images")
    .lean();
};

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function () {
  // Calculate items price
  this.itemsPrice = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Apply discount
  let discountedPrice = this.itemsPrice;
  if (this.discountPercentage > 0) {
    this.discountAmount = (this.itemsPrice * this.discountPercentage) / 100;
    discountedPrice = this.itemsPrice - this.discountAmount;
  } else if (this.discountAmount > 0) {
    discountedPrice = this.itemsPrice - this.discountAmount;
  }

  // Calculate tax
  this.taxPrice = discountedPrice * (this.taxRate / 100);

  // Calculate total
  this.totalPrice = discountedPrice + this.taxPrice + this.shippingPrice;

  return this;
};

// Instance method to update status
orderSchema.methods.updateStatus = function (newStatus, updatedBy = null, notes = "") {
  this.orderStatus = newStatus;
  
  if (updatedBy) {
    this.statusHistory.push({
      status: newStatus,
      updatedBy,
      notes,
      timestamp: new Date(),
    });
  }

  if (newStatus === "delivered") {
    this.isDelivered = true;
    this.deliveredAt = new Date();
  }

  return this.save();
};

// Instance method to mark as paid
orderSchema.methods.markAsPaid = function (paymentResult) {
  this.paymentStatus = "paid";
  this.isPaid = true;
  this.paidAt = new Date();
  
  if (paymentResult) {
    this.paymentResult = paymentResult;
  }

  return this.save();
};

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "shippingAddress.country": 1 });
orderSchema.index({ totalPrice: -1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ isPaid: 1 });
orderSchema.index({ isDelivered: 1 });
orderSchema.index({ paymentIntentId: 1 });
orderSchema.index({ checkoutSessionId: 1 });
orderSchema.index({ "items.product": 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;