import Stripe from "stripe";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables");
}

console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);

let stripe;
try {
  stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY || "dummy_key_for_development",
  );
} catch (error) {
  console.error("Failed to initialize Stripe:", error.message);
  stripe = null;
}

const isStripeAvailable = () => {
  if (!stripe) {
    console.error(
      "Stripe is not initialized. Check your STRIPE_SECRET_KEY in .env file",
    );
    return false;
  }
  if (process.env.STRIPE_SECRET_KEY === "dummy_key_for_development") {
    console.warn(
      "Using dummy Stripe key. Set STRIPE_SECRET_KEY in .env for production.",
    );
    return false;
  }
  return true;
};

export const createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { orderId, savePaymentMethod = false } = req.body;

  if (!orderId) {
    return next(new ErrorResponse("Order ID is required", 400));
  }

  const order = await Order.findById(orderId).populate("user", "email name");

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  if (order.user._id.toString() !== req.user.id) {
    return next(new ErrorResponse("Not authorized to pay for this order", 403));
  }

  if (order.isPaid) {
    return next(new ErrorResponse("Order is already paid", 400));
  }

  if (order.orderStatus === "cancelled") {
    return next(new ErrorResponse("Cannot pay a cancelled order", 400));
  }

  if (!isStripeAvailable()) {
    return next(
      new ErrorResponse(
        "Payment processing is currently unavailable. Please try again later.",
        503,
      ),
    );
  }

  try {
    let customer;

    if (req.user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id,
        },
      });

      await User.findByIdAndUpdate(req.user.id, {
        stripeCustomerId: customer.id,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: "usd",
      customer: customer.id,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
      description: `Payment for order #${order.orderNumber}`,
      setup_future_usage: savePaymentMethod ? "off_session" : undefined,
    });

    const payment = await Payment.create({
      user: req.user.id,
      order: order._id,
      paymentMethod: "stripe",
      paymentIntentId: paymentIntent.id,
      amount: order.totalPrice,
      currency: "usd",
      status: "requires_payment_method",
      metadata: {
        orderNumber: order.orderNumber,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
        orderNumber: order.orderNumber,
        amount: order.totalPrice,
      },
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    return next(
      new ErrorResponse(`Payment processing error: ${error.message}`, 500),
    );
  }
});

export const createStripeCheckoutSession = asyncHandler(
  async (req, res, next) => {
    const { orderId, successUrl, cancelUrl } = req.body;

    if (!orderId || !successUrl || !cancelUrl) {
      return next(
        new ErrorResponse(
          "Order ID, success URL, and cancel URL are required",
          400,
        ),
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorResponse("Order not found", 404));
    }

    if (order.user.toString() !== req.user.id) {
      return next(new ErrorResponse("Not authorized", 403));
    }

    if (order.isPaid) {
      return next(new ErrorResponse("Order is already paid", 400));
    }

    if (!isStripeAvailable()) {
      return next(
        new ErrorResponse(
          "Payment processing is currently unavailable. Please try again later.",
          503,
        ),
      );
    }

    try {
      let customerId = req.user.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.name,
          metadata: { userId: req.user.id },
        });
        customerId = customer.id;

        await User.findByIdAndUpdate(req.user.id, {
          stripeCustomerId: customerId,
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: order.items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
        cancel_url: `${cancelUrl}?order_id=${order._id}`,
        metadata: {
          orderId: order._id.toString(),
          userId: req.user.id,
        },
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU"],
        },
        customer_email: req.user.email,
        billing_address_collection: "required",
      });

      await Payment.create({
        user: req.user.id,
        order: order._id,
        paymentMethod: "stripe",
        checkoutSessionId: session.id,
        amount: order.totalPrice,
        currency: "usd",
        status: "pending",
        metadata: {
          orderNumber: order.orderNumber,
          sessionId: session.id,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error) {
      console.error("Stripe checkout session error:", error);
      return next(
        new ErrorResponse(`Checkout session error: ${error.message}`, 500),
      );
    }
  },
);

export const getPaymentMethods = asyncHandler(async (req, res, next) => {
  if (!isStripeAvailable()) {
    return res.status(200).json({
      success: true,
      data: [],
      message: "Payment methods unavailable. Stripe not configured.",
    });
  }

  try {
    let stripeMethods = [];

    if (req.user.stripeCustomerId) {
      const paymentMethods = await stripe.customers.listPaymentMethods(
        req.user.stripeCustomerId,
        { type: "card" },
      );

      stripeMethods = paymentMethods.data.map((method) => ({
        id: method.id,
        type: "card",
        brand: method.card.brand,
        last4: method.card.last4,
        expMonth: method.card.exp_month,
        expYear: method.card.exp_year,
        isDefault: false,
      }));
    }

    res.status(200).json({
      success: true,
      data: stripeMethods,
    });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return next(new ErrorResponse("Failed to get payment methods", 500));
  }
});

export const addPaymentMethod = asyncHandler(async (req, res, next) => {
  const { paymentMethodId, type = "card" } = req.body;

  if (!paymentMethodId) {
    return next(new ErrorResponse("Payment method ID is required", 400));
  }

  if (!isStripeAvailable()) {
    return next(
      new ErrorResponse(
        "Payment processing is currently unavailable. Please try again later.",
        503,
      ),
    );
  }

  try {
    if (type === "card") {
      if (!req.user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          name: req.user.name,
          metadata: { userId: req.user.id },
        });

        await User.findByIdAndUpdate(req.user.id, {
          stripeCustomerId: customer.id,
        });
      }

      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: req.user.stripeCustomerId,
      });

      res.status(200).json({
        success: true,
        message: "Payment method added successfully",
      });
    } else {
      return next(new ErrorResponse("Unsupported payment method type", 400));
    }
  } catch (error) {
    console.error("Add payment method error:", error);
    return next(
      new ErrorResponse(`Failed to add payment method: ${error.message}`, 500),
    );
  }
});

export const removePaymentMethod = asyncHandler(async (req, res, next) => {
  const { methodId } = req.params;

  if (!isStripeAvailable()) {
    return next(
      new ErrorResponse(
        "Payment processing is currently unavailable. Please try again later.",
        503,
      ),
    );
  }

  try {
    await stripe.paymentMethods.detach(methodId);

    res.status(200).json({
      success: true,
      message: "Payment method removed successfully",
    });
  } catch (error) {
    console.error("Remove payment method error:", error);
    return next(
      new ErrorResponse(
        `Failed to remove payment method: ${error.message}`,
        500,
      ),
    );
  }
});

export const setDefaultPaymentMethod = asyncHandler(async (req, res, next) => {
  const { methodId } = req.params;

  if (!isStripeAvailable()) {
    return next(
      new ErrorResponse(
        "Payment processing is currently unavailable. Please try again later.",
        503,
      ),
    );
  }

  try {
    await stripe.customers.update(req.user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: methodId,
      },
    });

    await User.findByIdAndUpdate(req.user.id, {
      defaultPaymentMethod: methodId,
    });

    res.status(200).json({
      success: true,
      message: "Default payment method updated successfully",
    });
  } catch (error) {
    console.error("Set default payment method error:", error);
    return next(
      new ErrorResponse(
        `Failed to set default payment method: ${error.message}`,
        500,
      ),
    );
  }
});

export const getPaymentHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user.id };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate({
        path: "order",
        select: "orderNumber totalPrice orderStatus",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Payment.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

export const getPaymentDetails = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.paymentId)
    .populate({
      path: "order",
      select: "orderNumber items totalPrice orderStatus shippingAddress",
      populate: {
        path: "items.product",
        select: "name price images",
      },
    })
    .populate("user", "name email");

  if (!payment) {
    return next(new ErrorResponse("Payment not found", 404));
  }

  if (
    payment.user._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(new ErrorResponse("Not authorized", 403));
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
});

export const refundPayment = asyncHandler(async (req, res, next) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  const payment = await Payment.findById(paymentId).populate("order");

  if (!payment) {
    return next(new ErrorResponse("Payment not found", 404));
  }

  if (payment.status !== "succeeded") {
    return next(
      new ErrorResponse("Only succeeded payments can be refunded", 400),
    );
  }

  if (payment.refunded) {
    return next(new ErrorResponse("Payment is already refunded", 400));
  }

  if (!isStripeAvailable()) {
    return next(
      new ErrorResponse(
        "Payment processing is currently unavailable. Please try again later.",
        503,
      ),
    );
  }

  try {
    let refund;

    if (payment.paymentMethod === "stripe" && payment.paymentIntentId) {
      refund = await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || "requested_by_customer",
      });
    } else {
      return next(
        new ErrorResponse("Cannot process refund for this payment method", 400),
      );
    }

    payment.refunded = true;
    payment.refundId = refund.id;
    payment.refundedAt = new Date();
    payment.refundAmount = amount || payment.amount;
    payment.refundReason = reason;
    await payment.save();

    const order = payment.order;
    order.paymentStatus = "refunded";
    order.orderStatus = "refunded";
    await order.save();

    const user = await User.findById(payment.user);
    if (user) {
    }

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    console.error("Refund error:", error);
    return next(new ErrorResponse(`Refund failed: ${error.message}`, 500));
  }
});

export const handleStripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isStripeAvailable()) {
    console.error("Stripe webhook received but Stripe not configured");
    return res.status(400).send("Stripe not configured");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;

    case "checkout.session.completed":
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;

    case "charge.refunded":
      const charge = event.data.object;
      await handleChargeRefunded(charge);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      {
        status: "succeeded",
        capturedAt: new Date(),
        transactionId: paymentIntent.charges.data[0]?.id,
      },
      { new: true },
    ).populate("order");

    if (payment && payment.order) {
      const order = payment.order;
      order.paymentStatus = "paid";
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date(),
      };
      await order.save();
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
  }
};

const handleFailedPayment = async (paymentIntent) => {
  await Payment.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    { status: "failed", error: paymentIntent.last_payment_error?.message },
  );
};

const handleCheckoutSessionCompleted = async (session) => {
  const orderId = session.metadata?.orderId;

  if (orderId) {
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "paid";
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();

      await Payment.findOneAndUpdate(
        { checkoutSessionId: session.id },
        { status: "succeeded", capturedAt: new Date() },
      );
    }
  }
};

const handleChargeRefunded = async (charge) => {
  const payment = await Payment.findOne({ transactionId: charge.id });
  if (payment) {
    payment.refunded = true;
    payment.refundId = charge.refunds.data[0]?.id;
    payment.refundedAt = new Date();
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = "refunded";
      order.orderStatus = "refunded";
      await order.save();
    }
  }
};

export const createCartPayment = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, savePaymentMethod = false } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorResponse("Cart items are required", 400));
  }

  if (!shippingAddress) {
    return next(new ErrorResponse("Shipping address is required", 400));
  }

  const totalAmount = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  if (!isStripeAvailable()) {
    return next(
      new ErrorResponse(
        "Payment processing is currently unavailable. Please try again later.",
        503,
      ),
    );
  }

  try {
    let customer;

    if (req.user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id,
        },
      });

      await User.findByIdAndUpdate(req.user.id, {
        stripeCustomerId: customer.id,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      customer: customer.id,
      metadata: {
        userId: req.user.id,
        itemCount: items.length.toString(),
      },
      description: `Payment for ${items.length} items`,
      setup_future_usage: savePaymentMethod ? "off_session" : undefined,
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
      },
    });
  } catch (error) {
    console.error("Cart payment intent error:", error);
    return next(
      new ErrorResponse(`Payment processing error: ${error.message}`, 500),
    );
  }
});

export const confirmPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, orderId } = req.body;

  if (!paymentIntentId) {
    return next(new ErrorResponse("Payment intent ID is required", 400));
  }

  if (!isStripeAvailable()) {
    return next(
      new ErrorResponse(
        "Payment processing is currently unavailable. Please try again later.",
        503,
      ),
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = "paid";
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date(),
          };
          await order.save();
        }
      }

      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed yet",
        data: {
          status: paymentIntent.status,
        },
      });
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    return next(
      new ErrorResponse(`Failed to confirm payment: ${error.message}`, 500),
    );
  }
});

export const testStripeConnection = asyncHandler(async (req, res, next) => {
  if (!isStripeAvailable()) {
    return res.status(503).json({
      success: false,
      message:
        "Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.",
    });
  }

  try {
    const balance = await stripe.balance.retrieve();

    res.status(200).json({
      success: true,
      message: "Stripe connection successful",
      data: {
        stripe: "connected",
        livemode: balance.livemode,
        available: balance.available,
        pending: balance.pending,
      },
    });
  } catch (error) {
    console.error("Stripe connection test failed:", error);
    return res.status(500).json({
      success: false,
      message: `Stripe connection failed: ${error.message}`,
      hint: "Make sure you have set the correct STRIPE_SECRET_KEY in your .env file",
    });
  }
});

export const getAvailablePaymentMethods = asyncHandler(
  async (req, res, next) => {
    const paymentMethods = [
      {
        id: "stripe",
        name: "Credit / Debit Card",
        type: "card",
        icon: "💳",
        description: "Pay securely with your credit or debit card",
        isActive: true,
        isAvailable: true,
        brands: ["Visa", "Mastercard", "Amex", "Discover"],
      },
      {
        id: "paypal",
        name: "PayPal",
        type: "paypal",
        icon: "🅿️",
        description: "Pay with your PayPal account",
        isActive: false,
        isAvailable: false,
        comingSoon: true,
      },
    ];

    res.status(200).json({
      success: true,
      data: paymentMethods,
    });
  },
);
