import Category from "../models/Category.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import { upload } from "../index.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = asyncHandler(async (req, res, next) => {
  const {
    isActive = "true",
    featured,
    parent = null,
    limit = 100,
    sort = "sortOrder",
    includeProducts = "false",
  } = req.query;

  // Build query
  let query = {};

  // Filter by active status
  if (isActive !== "all") {
    query.isActive = isActive === "true";
  }

  // Filter by featured
  if (featured !== undefined) {
    query.featured = featured === "true";
  }

  // Filter by parent (null for root categories, specific ID for subcategories)
  if (parent !== undefined) {
    if (parent === "null" || parent === "root") {
      query.parent = null;
    } else {
      query.parent = parent;
    }
  }

  // Build sort object
  let sortObj = {};
  if (sort) {
    const sortFields = sort.split(",");
    sortFields.forEach((field) => {
      const order = field.startsWith("-") ? -1 : 1;
      const fieldName = field.replace("-", "");
      sortObj[fieldName] = order;
    });
  }

  // Execute query
  const categories = await Category.find(query)
    .sort(sortObj)
    .limit(parseInt(limit));

  // If includeProducts is true, populate products count
  if (includeProducts === "true") {
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const productsCount = await Product.countDocuments({
          category: category._id,
          isActive: true,
        });
        return {
          ...category.toObject(),
          activeProductsCount: productsCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categoriesWithProducts,
    });
  }

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }

  // Get parent category if exists
  let parentCategory = null;
  if (category.parent) {
    parentCategory = await Category.findById(category.parent).select(
      "name slug"
    );
  }

  // Get subcategories
  const subcategories = await Category.find({
    parent: category._id,
    isActive: true,
  }).select("name slug description image productCount");

  // Get active products count
  const activeProductsCount = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });

  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      parentCategory,
      subcategories,
      activeProductsCount,
    },
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res, next) => {
  // Check if category with same name already exists
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
  });

  if (existingCategory) {
    return next(
      new ErrorResponse(
        `Category with name "${req.body.name}" already exists`,
        400
      )
    );
  }

  // Validate parent category if provided
  if (req.body.parent) {
    const parentCategory = await Category.findById(req.body.parent);
    if (!parentCategory) {
      return next(new ErrorResponse("Parent category not found", 404));
    }

    // Prevent circular references
    if (req.body.parent === req.params.id) {
      return next(new ErrorResponse("Category cannot be its own parent", 400));
    }
  }

  // Handle uploaded image
  if (req.file) {
    req.body.image = {
      url: req.file.path,
      publicId: req.file.filename,
      altText: req.body.imageAltText || req.body.name,
    };
  }

  // Set sortOrder if not provided
  if (!req.body.sortOrder) {
    const maxSortOrder = await Category.findOne()
      .sort("-sortOrder")
      .select("sortOrder");
    req.body.sortOrder = maxSortOrder ? maxSortOrder.sortOrder + 1 : 0;
  }

  // Create category
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }

  // Check if category with same name already exists (excluding current category)
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
      _id: { $ne: req.params.id },
    });

    if (existingCategory) {
      return next(
        new ErrorResponse(
          `Category with name "${req.body.name}" already exists`,
          400
        )
      );
    }
  }

  // Validate parent category if being updated
  if (req.body.parent && req.body.parent !== category.parent?.toString()) {
    // Prevent setting parent to self
    if (req.body.parent === req.params.id) {
      return next(new ErrorResponse("Category cannot be its own parent", 400));
    }

    // Check if parent exists
    const parentCategory = await Category.findById(req.body.parent);
    if (!parentCategory) {
      return next(new ErrorResponse("Parent category not found", 404));
    }

    // Prevent circular references (check if new parent is a descendant of this category)
    const isDescendant = await checkDescendantCategories(
      req.body.parent,
      req.params.id
    );
    if (isDescendant) {
      return next(
        new ErrorResponse("Cannot set a descendant category as parent", 400)
      );
    }
  }

  // Handle image upload
  if (req.file) {
    // Delete old image from Cloudinary if exists
    if (category.image && category.image.publicId) {
      try {
        await cloudinary.uploader.destroy(category.image.publicId);
      } catch (error) {
        console.error("Failed to delete old image:", error.message);
      }
    }

    req.body.image = {
      url: req.file.path,
      publicId: req.file.filename,
      altText: req.body.imageAltText || category.name,
    };
  } else if (req.body.removeImage === "true") {
    // Remove image if requested
    if (category.image && category.image.publicId) {
      try {
        await cloudinary.uploader.destroy(category.image.publicId);
      } catch (error) {
        console.error("Failed to delete image:", error.message);
      }
    }
    req.body.image = null;
  }

  // Update category
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404)
    );
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category with ${productCount} products. Remove products first or reassign them to another category.`,
        400
      )
    );
  }

  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({
    parent: category._id,
  });
  if (subcategoryCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category with ${subcategoryCount} subcategories. Remove subcategories first.`,
        400
      )
    );
  }

  // Delete image from Cloudinary if exists
  if (category.image && category.image.publicId) {
    try {
      await cloudinary.uploader.destroy(category.image.publicId);
    } catch (error) {
      console.error("Failed to delete image:", error.message);
    }
  }

  // Delete category
  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: {},
  });
});

// @desc    Upload category image middleware
// @route   Middleware
// @access  Private
export const uploadCategoryImage = upload.single("image");

// @desc    Process category image middleware
// @route   Middleware
// @access  Private
export const processCategoryImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  // Add image data to req.body
  req.body.image = {
    url: req.file.path,
    publicId: req.file.filename,
    altText: req.body.imageAltText || req.body.name,
  };

  next();
});

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = asyncHandler(async (req, res, next) => {
  const { includeProducts = "false", maxDepth = 3 } = req.query;

  // Get all categories
  const allCategories = await Category.find({
    isActive: true,
  }).sort("sortOrder");

  // Build tree structure
  const buildTree = (parentId = null, depth = 0) => {
    if (depth >= parseInt(maxDepth)) return [];

    const children = allCategories
      .filter((cat) => {
        if (parentId === null) {
          return cat.parent === null || !cat.parent;
        }
        return cat.parent && cat.parent.toString() === parentId.toString();
      })
      .map((cat) => {
        const childCategories = buildTree(cat._id, depth + 1);
        return {
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          productCount: cat.productCount,
          featured: cat.featured,
          sortOrder: cat.sortOrder,
          children: childCategories,
          depth: depth,
        };
      });

    return children;
  };

  const categoryTree = buildTree();

  // If includeProducts is true, add product information
  if (includeProducts === "true") {
    const enhancedTree = await Promise.all(
      categoryTree.map(async (category) => {
        const enhanceCategory = async (cat) => {
          // Get featured products for this category
          const featuredProducts = await Product.find({
            category: cat._id,
            isActive: true,
            featured: true,
          })
            .select("name price images slug averageRating")
            .limit(4);

          // Enhance children recursively
          const enhancedChildren = await Promise.all(
            cat.children.map((child) => enhanceCategory(child))
          );

          return {
            ...cat,
            featuredProducts,
            children: enhancedChildren,
          };
        };

        return await enhanceCategory(category);
      })
    );

    return res.status(200).json({
      success: true,
      count: enhancedTree.length,
      data: enhancedTree,
    });
  }

  res.status(200).json({
    success: true,
    count: categoryTree.length,
    data: categoryTree,
  });
});

// @desc    Get category with products
// @route   GET /api/categories/:id/products
// @access  Public
export const getCategoryWithProducts = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  // Get query parameters for products
  const {
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
    rating,
    sort = "-createdAt",
    inStock = "true",
  } = req.query;

  const skip = (page - 1) * limit;

  // Build product query
  let productQuery = {
    category: category._id,
    isActive: true,
  };

  // Price filter
  if (minPrice || maxPrice) {
    productQuery.price = {};
    if (minPrice) productQuery.price.$gte = Number(minPrice);
    if (maxPrice) productQuery.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) {
    productQuery.averageRating = { $gte: Number(rating) };
  }

  // Stock filter
  if (inStock === "true") {
    productQuery.stock = { $gt: 0 };
  } else if (inStock === "false") {
    productQuery.stock = { $lte: 0 };
  }

  // Build sort object
  let sortObj = {};
  if (sort) {
    const sortFields = sort.split(",");
    sortFields.forEach((field) => {
      const order = field.startsWith("-") ? -1 : 1;
      const fieldName = field.replace("-", "");
      sortObj[fieldName] = order;
    });
  }

  // Get products
  const products = await Product.find(productQuery)
    .select("name price images slug category averageRating stock featured")
    .populate("category", "name slug")
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const totalProducts = await Product.countDocuments(productQuery);
  const totalPages = Math.ceil(totalProducts / limit);

  // Get subcategories
  const subcategories = await Category.find({
    parent: category._id,
    isActive: true,
  }).select("name slug description image productCount");

  // Get parent category if exists
  let parentCategory = null;
  if (category.parent) {
    parentCategory = await Category.findById(category.parent).select(
      "name slug"
    );
  }

  res.status(200).json({
    success: true,
    data: {
      category: {
        ...category.toObject(),
        parentCategory,
        subcategories,
      },
      products: {
        data: products,
        count: products.length,
        total: totalProducts,
        totalPages,
        currentPage: parseInt(page),
        filters: {
          minPrice,
          maxPrice,
          rating,
          sort,
          inStock,
        },
      },
    },
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const categories = await Category.find({
    featured: true,
    isActive: true,
    parent: null, // Only root categories
  })
    .select("name slug description image productCount")
    .sort("sortOrder")
    .limit(limit);

  // Add product count and featured products
  const enhancedCategories = await Promise.all(
    categories.map(async (category) => {
      // Get featured products for this category
      const featuredProducts = await Product.find({
        category: category._id,
        isActive: true,
        featured: true,
        stock: { $gt: 0 },
      })
        .select("name price images slug averageRating")
        .limit(4);

      return {
        ...category.toObject(),
        featuredProducts,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: enhancedCategories.length,
    data: enhancedCategories,
  });
});

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle-active
// @access  Private/Admin
export const toggleCategoryActive = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  // If deactivating, check if category has active products
  if (category.isActive) {
    const activeProductCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    if (activeProductCount > 0) {
      return next(
        new ErrorResponse(
          `Cannot deactivate category with ${activeProductCount} active products. Deactivate products first or reassign them.`,
          400
        )
      );
    }

    // Also deactivate subcategories
    await Category.updateMany({ parent: category._id }, { isActive: false });
  } else {
    // If activating, also activate parent if it's inactive
    if (category.parent) {
      const parentCategory = await Category.findById(category.parent);
      if (parentCategory && !parentCategory.isActive) {
        return next(
          new ErrorResponse(
            "Cannot activate category with inactive parent. Activate parent category first.",
            400
          )
        );
      }
    }
  }

  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json({
    success: true,
    message: `Category ${
      category.isActive ? "activated" : "deactivated"
    } successfully`,
    data: {
      _id: category._id,
      name: category.name,
      isActive: category.isActive,
    },
  });
});

// @desc    Update category order
// @route   PATCH /api/categories/:id/order
// @access  Private/Admin
export const updateCategoryOrder = asyncHandler(async (req, res, next) => {
  const { sortOrder, parent = null } = req.body;

  if (sortOrder === undefined) {
    return next(new ErrorResponse("sortOrder is required", 400));
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  // Update sort order for this category
  category.sortOrder = parseInt(sortOrder);

  // Update parent if provided
  if (parent !== undefined) {
    if (parent === null || parent === "null") {
      category.parent = null;
    } else {
      // Validate parent exists
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return next(new ErrorResponse("Parent category not found", 404));
      }
      category.parent = parent;
    }
  }

  await category.save();

  // Reorder other categories if necessary
  if (parent !== undefined) {
    await reorderCategories(category.parent);
  }

  res.status(200).json({
    success: true,
    message: "Category order updated successfully",
    data: category,
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/stats/overview
// @access  Private/Admin
export const getCategoryStats = asyncHandler(async (req, res, next) => {
  // Get basic category stats
  const stats = await Category.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: { $sum: { $cond: ["$isActive", 1, 0] } },
        featuredCategories: { $sum: { $cond: ["$featured", 1, 0] } },
        rootCategories: {
          $sum: {
            $cond: [
              { $or: [{ $eq: ["$parent", null] }, { $not: "$parent" }] },
              1,
              0,
            ],
          },
        },
        subcategories: {
          $sum: {
            $cond: [{ $and: ["$parent", { $ne: ["$parent", null] }] }, 1, 0],
          },
        },
        totalProductCount: { $sum: "$productCount" },
      },
    },
  ]);

  // Get categories with most products
  const topCategories = await Category.find({ isActive: true })
    .select("name slug productCount isActive featured")
    .sort("-productCount")
    .limit(10);

  // Get categories by depth
  const categoriesByDepth = await Category.aggregate([
    {
      $graphLookup: {
        from: "categories",
        startWith: "$parent",
        connectFromField: "parent",
        connectToField: "_id",
        as: "ancestors",
        depthField: "depth",
      },
    },
    {
      $project: {
        name: 1,
        depth: { $size: "$ancestors" },
      },
    },
    {
      $group: {
        _id: "$depth",
        count: { $sum: 1 },
        categories: { $push: "$name" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Get category growth over time
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const categoryGrowth = await Category.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            {
              $toString: {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            },
          ],
        },
        count: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalCategories: 0,
        activeCategories: 0,
        featuredCategories: 0,
        rootCategories: 0,
        subcategories: 0,
        totalProductCount: 0,
      },
      topCategories,
      categoriesByDepth,
      categoryGrowth,
    },
  });
});

// Helper function to check if a category is a descendant of another
const checkDescendantCategories = async (parentId, childId) => {
  if (parentId === childId) return true;

  const parentCategory = await Category.findById(parentId);
  if (!parentCategory || !parentCategory.parent) return false;

  return checkDescendantCategories(parentCategory.parent, childId);
};

// Helper function to reorder categories
const reorderCategories = async (parentId = null) => {
  const categories = await Category.find({
    parent: parentId,
    isActive: true,
  }).sort("sortOrder");

  // Update sortOrder to be sequential
  await Promise.all(
    categories.map(async (category, index) => {
      if (category.sortOrder !== index) {
        category.sortOrder = index;
        await category.save();
      }
    })
  );
};
