import express from "express";
import {
  createPaymentIntent,
  createStripeCheckoutSession,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment,
  handleStripeWebhook,
  createCartPayment,
  confirmPayment,
  testStripeConnection,
} from "../controllers/PaymentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Webhook route for Stripe only
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Public test route
router.get("/test", testStripeConnection);

// All routes below require authentication
router.use(protect);

// Payment processing routes (Stripe only)
router.post("/create-intent", createPaymentIntent);
router.post("/create-cart-payment", createCartPayment);
router.post("/confirm", confirmPayment);
router.post("/checkout-session", createStripeCheckoutSession);

// Payment methods management
router.get("/methods", getPaymentMethods);
router.post("/methods", addPaymentMethod);
router.delete("/methods/:methodId", removePaymentMethod);
router.put("/methods/:methodId/default", setDefaultPaymentMethod);

// Payment history and details
router.get("/history", getPaymentHistory);
router.get("/:paymentId", getPaymentDetails);

// Admin routes for refunds
router.post("/:paymentId/refund", authorize("admin"), refundPayment);

export default router;