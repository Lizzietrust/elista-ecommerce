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
  getAvailablePaymentMethods,
} from "../controllers/PaymentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

router.get("/test", testStripeConnection);

router.use(protect);

router.post("/create-intent", createPaymentIntent);
router.post("/create-cart-payment", createCartPayment);
router.post("/confirm", confirmPayment);
router.post("/checkout-session", createStripeCheckoutSession);

router.get("/methods", getPaymentMethods);
router.post("/methods", addPaymentMethod);
router.delete("/methods/:methodId", removePaymentMethod);
router.put("/methods/:methodId/default", setDefaultPaymentMethod);

router.get("/history", getPaymentHistory);

router.post("/:paymentId/refund", authorize("admin"), refundPayment);
router.get("/methods/available", protect, getAvailablePaymentMethods);

router.get("/:paymentId", getPaymentDetails);

export default router;
