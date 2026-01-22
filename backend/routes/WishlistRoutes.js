import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkInWishlist,
  updateWishlistItem,
  moveToCart,
  generateShareLink,
  getSharedWishlist,
  revokeShareLink,
  getWishlistCount,
  getRecentWishlistItems,
  getWishlistStats,
} from "../controllers/WishlistController.js";
import { protect } from "../middleware/auth.js";
import { validateWishlistItem } from "../middleware/validators.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Main wishlist routes
router.get("/", getWishlist);
router.post("/", validateWishlistItem, addToWishlist);
router.delete("/clear", clearWishlist);
router.get("/count", getWishlistCount);
router.get("/recent", getRecentWishlistItems);
router.get("/stats", getWishlistStats);

// Single item operations
router.get("/check/:productId", checkInWishlist);
router.delete("/:productId", removeFromWishlist);
router.put("/:productId", updateWishlistItem);
router.post("/:productId/move-to-cart", moveToCart);

// Sharing routes
router.post("/share", generateShareLink);
router.delete("/share", revokeShareLink);

// Public route for shared wishlists
router.get("/share/:token", getSharedWishlist);

export default router;
