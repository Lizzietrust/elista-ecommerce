import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  processProductImages,
  getFeaturedProducts,
  getProductsByCategory,
  getNewArrivals,
  getBestSellers,
  searchProducts,
  getRelatedProducts,
  updateProductStock,
  toggleProductActive,
  getProductsBySeller,
  getProductStats,
  bulkUpdateProducts,
} from "../controllers/ProductController.js";
import { protect, authorize, optionalAuth } from "../middleware/auth.js";
import {
  validateProduct,
  validateProductUpdate,
} from "../middleware/validators.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/related/:productId", getRelatedProducts);
router.get("/:id", optionalAuth, getProductById);

// Seller routes (if you have seller role)
router.get(
  "/seller/my-products",
  protect,
  authorize("seller", "admin"),
  getProductsBySeller
);

// Protected routes (Admin & Seller)
router.use(protect);

router.post(
  "/",
  authorize("admin", "seller"),
  uploadProductImages,
  processProductImages,
  validateProduct,
  createProduct
);

router.put(
  "/:id",
  authorize("admin", "seller"),
  uploadProductImages,
  processProductImages,
  validateProductUpdate,
  updateProduct
);

router.patch("/:id/stock", authorize("admin", "seller"), updateProductStock);
router.patch(
  "/:id/toggle-active",
  authorize("admin", "seller"),
  toggleProductActive
);
router.delete("/:id", authorize("admin", "seller"), deleteProduct);

// Admin only routes
router.get("/stats/overview", authorize("admin"), getProductStats);
router.post("/bulk-update", authorize("admin"), bulkUpdateProducts);

export default router;
