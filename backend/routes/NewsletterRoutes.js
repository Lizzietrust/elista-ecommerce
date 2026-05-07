import express from "express";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getAllSubscribers,
  getSubscriberCount,
  exportSubscribersCSV,
  sendBulkNewsletter,
  getSubscriberDetails,
  deleteSubscriber,
  getSubscriptionStats,
} from "../controllers/NewsletterController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/subscribe", subscribeToNewsletter);
router.post("/unsubscribe", unsubscribeFromNewsletter);
router.get("/unsubscribe/:token", unsubscribeFromNewsletter);

// Protected routes (admin only)
router.get("/subscribers", protect, authorize("admin"), getAllSubscribers);
router.get(
  "/subscribers/:id",
  protect,
  authorize("admin"),
  getSubscriberDetails,
);
router.delete(
  "/subscribers/:id",
  protect,
  authorize("admin"),
  deleteSubscriber,
);
router.get("/count", protect, authorize("admin"), getSubscriberCount);
router.get("/stats", protect, authorize("admin"), getSubscriptionStats);
router.get("/export", protect, authorize("admin"), exportSubscribersCSV);
router.post("/broadcast", protect, authorize("admin"), sendBulkNewsletter);

export default router;
