import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  deactivateUser,
  activateUser,
  getUserStats,
  getUserOrders,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  updateUserPreferences,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  getUserProfile,
} from "../controllers/UserController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validateUserUpdate } from "../middleware/validators.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes (for current user)
router.get("/profile", getUserProfile);
router.put("/profile", validateUserUpdate, updateUser);
router.put("/preferences", updateUserPreferences);

// Wishlist routes
router.get("/wishlist", getUserWishlist);
router.post("/wishlist/:productId", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

// Address management routes
router.get("/addresses", getUserAddresses);
router.post("/addresses", addUserAddress);
router.put("/addresses/:addressId", updateUserAddress);
router.delete("/addresses/:addressId", deleteUserAddress);
router.patch("/addresses/:addressId/default", setDefaultAddress);

// User orders
router.get("/orders", getUserOrders);

// Admin only routes
router.use(authorize("admin", "moderator"));

router.get("/", getAllUsers);
router.get("/stats", getUserStats);
router.get("/:id", getUserById);
router.put("/:id/role", updateUserRole);
router.patch("/:id/deactivate", deactivateUser);
router.patch("/:id/activate", activateUser);
router.delete("/:id", deleteUser);

export default router;
