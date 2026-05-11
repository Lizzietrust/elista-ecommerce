import express from "express";
import {
  getAllCategories,
  getPaginatedCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  processCategoryImage,
  getCategoryTree,
  getCategoryWithProducts,
  getFeaturedCategories,
  toggleCategoryActive,
  updateCategoryOrder,
  getCategoryStats,
} from "../controllers/CategoryController.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  validateCategory,
  validateCategoryUpdate,
} from "../middleware/validators.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/paginated", getPaginatedCategories);
router.get("/tree", getCategoryTree);
router.get("/featured", getFeaturedCategories);
router.get("/:id", getCategoryById);
router.get("/:id/products", getCategoryWithProducts);

router.use(protect);
router.use(authorize("admin"));

router.post(
  "/",
  uploadCategoryImage,
  processCategoryImage,
  validateCategory,
  createCategory,
);

router.put(
  "/:id",
  uploadCategoryImage,
  processCategoryImage,
  validateCategoryUpdate,
  updateCategory,
);

router.patch("/:id/toggle-active", toggleCategoryActive);
router.patch("/:id/order", updateCategoryOrder);
router.delete("/:id", deleteCategory);

router.get("/stats/overview", getCategoryStats);

export default router;
