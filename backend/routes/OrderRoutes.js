import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getUserOrders,
  getOrderSummary,
  getRecentOrders,
  getSalesAnalytics,
  updateOrderShipping,
  processOrderWebhook,
} from "../controllers/OrderController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateOrder } from "../middleware/validators.js";

const router = express.Router();

// Public webhook route (for payment gateways)
router.post("/webhook", processOrderWebhook);

// All routes below require authentication
router.use(protect);

// User order routes
router.post("/", validateOrder, createOrder);
router.get("/my-orders", getUserOrders);
router.get("/summary", getOrderSummary);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

// Admin routes (only for admin users)
router.use(authorize("admin", "seller"));

router.get("/", getOrders);
router.get("/recent", getRecentOrders);
router.get("/analytics/sales", getSalesAnalytics);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/shipping", updateOrderShipping);

export default router;
