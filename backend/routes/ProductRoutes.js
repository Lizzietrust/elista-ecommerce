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

router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);
router.get("/stats/overview", protect, authorize("admin"), getProductStats);
router.post("/bulk-update", protect, authorize("admin"), bulkUpdateProducts);
router.get(
  "/seller/my-products",
  protect,
  authorize("seller", "admin"),
  getProductsBySeller,
);

router.get("/category/:categoryId", getProductsByCategory);
router.get("/related/:productId", getRelatedProducts);

router.get("/", getAllProducts);

router.patch(
  "/:id/stock",
  protect,
  authorize("admin", "seller"),
  updateProductStock,
);
router.patch(
  "/:id/toggle-active",
  protect,
  authorize("admin", "seller"),
  toggleProductActive,
);
router.post(
  "/",
  protect,
  authorize("admin", "seller"),
  uploadProductImages,
  processProductImages,
  validateProduct,
  createProduct,
);
router.put(
  "/:id",
  protect,
  authorize("admin", "seller"),
  uploadProductImages,
  processProductImages,
  validateProductUpdate,
  updateProduct,
);
router.delete("/:id", protect, authorize("admin", "seller"), deleteProduct);

router.get("/:id", getProductById);

export default router;
