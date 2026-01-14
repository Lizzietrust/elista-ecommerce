import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import sendEmail from "../utils/sendEmail.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const {
    shippingAddress,
    paymentMethod,
    paymentResult,
    items,
    taxPrice,
    shippingPrice,
    couponCode,
    notes,
  } = req.body;

  // Validate cart items
  if (!items || items.length === 0) {
    return next(new ErrorResponse("No items in order", 400));
  }

  // Calculate prices from items
  const itemsPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Apply coupon if provided
  let coupon = null;
  let discountAmount = 0;

  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (coupon) {
      // Validate coupon
      const now = new Date();
      if (coupon.validUntil && now > coupon.validUntil) {
        return next(new ErrorResponse("Coupon has expired", 400));
      }

      if (coupon.validFrom && now < coupon.validFrom) {
        return next(new ErrorResponse("Coupon is not yet valid", 400));
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return next(new ErrorResponse("Coupon usage limit reached", 400));
      }

      if (coupon.minPurchaseAmount && itemsPrice < coupon.minPurchaseAmount) {
        return next(
          new ErrorResponse(
            `Minimum purchase amount of $${coupon.minPurchaseAmount} required`,
            400
          )
        );
      }

      // Calculate discount
      discountAmount = calculateDiscount(itemsPrice, coupon);
    }
  }

  // Calculate total price
  const totalPrice =
    itemsPrice + (taxPrice || 0) + (shippingPrice || 0) - discountAmount;

  // Check stock availability and update product stock
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate and update stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is not active`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      // Reduce stock
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save({ session });
    }

    // Create order
    const order = await Order.create(
      [
        {
          user: req.user.id,
          shippingAddress,
          paymentMethod,
          paymentResult,
          items,
          itemsPrice,
          taxPrice: taxPrice || 0,
          shippingPrice: shippingPrice || 0,
          discountAmount,
          totalPrice,
          coupon: coupon?._id,
          notes,
        },
      ],
      { session }
    );

    // Update coupon usage if used
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save({ session });
    }

    // Clear user's cart
    const user = await User.findById(req.user.id).session(session);
    user.cart.items = [];
    user.cart.coupon = null;
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Populate order details
    const populatedOrder = await Order.findById(order[0]._id)
      .populate("user", "name email")
      .populate("items.product", "name price images");

    // Send order confirmation email
    await sendOrderConfirmationEmail(populatedOrder, req.user);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  // Filter by status
  if (status) {
    query.orderStatus = status;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "name email")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate({
      path: "items.product",
      select: "name price images sku category",
      populate: {
        path: "category",
        select: "name",
      },
    })
    .populate("coupon", "code discountType discountValue");

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // Check if user is authorized to view this order
  if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to access this order", 403));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { user: req.user.id };

  if (status) {
    query.orderStatus = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate({
        path: "items.product",
        select: "name price images",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  if (!status) {
    return next(new ErrorResponse("Please provide status", 400));
  }

  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ];

  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse("Invalid status", 400));
  }

  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // Check if order can be updated to this status
  if (order.orderStatus === "cancelled" && status !== "cancelled") {
    return next(new ErrorResponse("Cannot update a cancelled order", 400));
  }

  if (order.orderStatus === "delivered" && status !== "delivered") {
    return next(new ErrorResponse("Cannot update a delivered order", 400));
  }

  // Update status
  const previousStatus = order.orderStatus;
  order.orderStatus = status;

  // Add status update to history
  order.statusHistory.push({
    status,
    updatedBy: req.user.id,
    notes,
    timestamp: new Date(),
  });

  await order.save();

  // Send status update email to customer
  await sendStatusUpdateEmail(order, previousStatus, status);

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // Check if user is authorized to cancel this order
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to cancel this order", 403));
  }

  // Check if order can be cancelled
  if (!["pending", "processing"].includes(order.orderStatus)) {
    return next(
      new ErrorResponse(
        `Cannot cancel order with status: ${order.orderStatus}`,
        400
      )
    );
  }

  // Restore product stock
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.stock += item.quantity;
        product.sold -= item.quantity;
        await product.save({ session });
      }
    }

    // Update order status
    order.orderStatus = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      updatedBy: req.user.id,
      notes: "Order cancelled by user",
      timestamp: new Date(),
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send cancellation email
    await sendCancellationEmail(order);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get order summary
// @route   GET /api/orders/summary
// @access  Private
export const getOrderSummary = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const [
    totalOrders,
    totalSpent,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.countDocuments({ user: userId, orderStatus: "pending" }),
    Order.countDocuments({ user: userId, orderStatus: "processing" }),
    Order.countDocuments({ user: userId, orderStatus: "delivered" }),
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber totalPrice orderStatus createdAt")
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      totalSpent: totalSpent[0]?.total || 0,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      recentOrders,
    },
  });
});

// @desc    Get recent orders (admin)
// @route   GET /api/orders/recent
// @access  Private/Admin
export const getRecentOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("user", "name email")
    .select("orderNumber user totalPrice orderStatus paymentStatus createdAt")
    .lean();

  res.status(200).json({
    success: true,
    data: orders,
  });
});

// @desc    Get sales analytics
// @route   GET /api/orders/analytics/sales
// @access  Private/Admin
export const getSalesAnalytics = asyncHandler(async (req, res, next) => {
  const { period = "month", year = new Date().getFullYear() } = req.query;

  let matchStage = {};
  let groupStage = {};

  // Set date range based on period
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  matchStage.createdAt = { $gte: startDate, $lt: endDate };

  if (period === "month") {
    groupStage = {
      _id: { month: { $month: "$createdAt" } },
      totalSales: { $sum: "$totalPrice" },
      totalOrders: { $sum: 1 },
      averageOrderValue: { $avg: "$totalPrice" },
    };
  } else if (period === "week") {
    groupStage = {
      _id: { week: { $week: "$createdAt" } },
      totalSales: { $sum: "$totalPrice" },
      totalOrders: { $sum: 1 },
      averageOrderValue: { $avg: "$totalPrice" },
    };
  } else if (period === "day") {
    groupStage = {
      _id: { day: { $dayOfMonth: "$createdAt" } },
      totalSales: { $sum: "$totalPrice" },
      totalOrders: { $sum: 1 },
      averageOrderValue: { $avg: "$totalPrice" },
    };
  }

  const analytics = await Order.aggregate([
    { $match: matchStage },
    { $group: groupStage },
    { $sort: { "_id.month": 1 } },
  ]);

  // Get top products
  const topProducts = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        product: "$product.name",
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
  ]);

  // Get sales by status
  const salesByStatus = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$orderStatus",
        totalSales: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      analytics,
      topProducts,
      salesByStatus,
      period,
      year,
    },
  });
});

// @desc    Update shipping information
// @route   PUT /api/orders/:id/shipping
// @access  Private/Admin
export const updateOrderShipping = asyncHandler(async (req, res, next) => {
  const { trackingNumber, carrier, estimatedDelivery } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // Update shipping info
  if (trackingNumber) order.shippingTracking = trackingNumber;
  if (carrier) order.shippingCarrier = carrier;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

  await order.save();

  // Send shipping update email
  await sendShippingUpdateEmail(order);

  res.status(200).json({
    success: true,
    message: "Shipping information updated successfully",
    data: order,
  });
});

// @desc    Process webhook from payment gateway
// @route   POST /api/orders/webhook
// @access  Public
export const processOrderWebhook = asyncHandler(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  // Verify webhook signature (implementation depends on payment gateway)
  // For Stripe: stripe.webhooks.constructEvent(payload, signature, secret)

  // Update order payment status based on webhook data
  const { orderId, paymentStatus, transactionId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Missing orderId" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Update payment status
  order.paymentStatus = paymentStatus;
  if (transactionId) {
    order.paymentResult = {
      id: transactionId,
      status: paymentStatus,
      update_time: new Date(),
    };
  }

  await order.save();

  res.status(200).json({ success: true, message: "Webhook processed" });
});

// Helper functions
const calculateDiscount = (amount, coupon) => {
  let discount = 0;

  switch (coupon.discountType) {
    case "percentage":
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
      break;
    case "fixed":
      discount = coupon.discountValue;
      if (discount > amount) {
        discount = amount;
      }
      break;
    case "free_shipping":
      discount = 0; // Handled separately
      break;
  }

  return discount;
};

const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const message = `
      <h1>Thank You for Your Order!</h1>
      <p>Dear ${user.name},</p>
      <p>Your order has been received and is being processed.</p>
      
      <h2>Order Details</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Order Date:</strong> ${new Date(
        order.createdAt
      ).toLocaleDateString()}</p>
      <p><strong>Total Amount:</strong> $${order.totalPrice.toFixed(2)}</p>
      
      <h2>Items Ordered</h2>
      <ul>
        ${order.items
          .map(
            (item) => `
          <li>
            ${item.product.name} - ${item.quantity} x $${item.price} = $${(
              item.quantity * item.price
            ).toFixed(2)}
          </li>
        `
          )
          .join("")}
      </ul>
      
      <p>You can track your order status in your account dashboard.</p>
      <p>Thank you for shopping with us!</p>
    `;

    await sendEmail({
      email: user.email,
      subject: `Order Confirmation - #${order.orderNumber}`,
      html: message,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
};

const sendStatusUpdateEmail = async (order, previousStatus, newStatus) => {
  try {
    const user = await User.findById(order.user);
    if (!user) return;

    const message = `
      <h1>Order Status Update</h1>
      <p>Dear ${user.name},</p>
      <p>Your order status has been updated.</p>
      
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Previous Status:</strong> ${previousStatus}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
      <p><strong>Updated On:</strong> ${new Date().toLocaleDateString()}</p>
      
      <p>You can view your order details in your account dashboard.</p>
      <p>Thank you for shopping with us!</p>
    `;

    await sendEmail({
      email: user.email,
      subject: `Order Status Update - #${order.orderNumber}`,
      html: message,
    });
  } catch (error) {
    console.error("Failed to send status update email:", error);
  }
};

const sendCancellationEmail = async (order) => {
  try {
    const user = await User.findById(order.user);
    if (!user) return;

    const message = `
      <h1>Order Cancelled</h1>
      <p>Dear ${user.name},</p>
      <p>Your order has been cancelled as requested.</p>
      
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Cancelled On:</strong> ${new Date().toLocaleDateString()}</p>
      
      <p>If this was a mistake or you have any questions, please contact our support team.</p>
      <p>Thank you for shopping with us!</p>
    `;

    await sendEmail({
      email: user.email,
      subject: `Order Cancelled - #${order.orderNumber}`,
      html: message,
    });
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
  }
};

const sendShippingUpdateEmail = async (order) => {
  try {
    const user = await User.findById(order.user);
    if (!user) return;

    const message = `
      <h1>Shipping Update</h1>
      <p>Dear ${user.name},</p>
      <p>Your order has been shipped!</p>
      
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Carrier:</strong> ${order.shippingCarrier}</p>
      <p><strong>Tracking Number:</strong> ${order.shippingTracking}</p>
      ${
        order.estimatedDelivery
          ? `<p><strong>Estimated Delivery:</strong> ${new Date(
              order.estimatedDelivery
            ).toLocaleDateString()}</p>`
          : ""
      }
      
      <p>You can track your package using the tracking number above.</p>
      <p>Thank you for shopping with us!</p>
    `;

    await sendEmail({
      email: user.email,
      subject: `Shipping Update - #${order.orderNumber}`,
      html: message,
    });
  } catch (error) {
    console.error("Failed to send shipping update email:", error);
  }
};
