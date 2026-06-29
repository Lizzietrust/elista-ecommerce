import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  getCartSummary,
  moveToWishlist,
  updateCartItemQuantity,
  mergeCart,
  getCartCount,
} from "../controllers/CartController.js";
import { protect } from "../middleware/auth.js";
import {
  validateRequest,
  validateCartItem,
  validateCartQuantity,
} from "../middleware/validators.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.get("/summary", getCartSummary);
router.get("/count", getCartCount);
router.post("/add", validateCartItem, addToCart);
router.put("/:itemId", updateCartItem);
router.patch("/:itemId/quantity", validateCartQuantity, updateCartItemQuantity);
router.delete("/:itemId", removeFromCart);
router.delete("/", clearCart);
router.post("/coupon/apply", applyCoupon);
router.delete("/coupon/remove", removeCoupon);
router.post("/:itemId/move-to-wishlist", moveToWishlist);
router.post("/merge", mergeCart);

export default router;
