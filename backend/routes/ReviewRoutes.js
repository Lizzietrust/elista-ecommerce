import express from "express";
import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getUserReviews,
  getMyReviews,
  reportReview,
  getRecentReviews,
  getHelpfulReviews,
} from "../controllers/ReviewController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateReview } from "../middleware/validators.js";

const router = express.Router();

// Public routes
router.get("/", getReviews);
router.get("/recent", getRecentReviews);
router.get("/helpful", getHelpfulReviews);
router.get("/product/:productId", getProductReviews);
router.get("/:id", getReview);

// Protected routes
router.use(protect);

router.post("/", validateReview, createReview);
router.get("/me", getMyReviews);
router.get("/user/:userId", authorize("admin"), getUserReviews);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.post("/:id/report", reportReview);

export default router;
