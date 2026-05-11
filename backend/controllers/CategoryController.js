import Category from "../models/Category.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/categories/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
  const {
    isActive = "true",
    featured,
    parent = null,
    limit = 100,
    sort = "sortOrder",
    includeProducts = "false",
  } = req.query;

  let query = {};

  if (isActive !== "all") {
    query.isActive = isActive === "true";
  }

  if (featured !== undefined) {
    query.featured = featured === "true";
  }

  if (parent !== undefined) {
    if (parent === "null" || parent === "root") {
      query.parent = null;
    } else {
      query.parent = parent;
    }
  }

  let sortObj = {};
  if (sort) {
    const sortFields = sort.split(",");
    sortFields.forEach((field) => {
      const order = field.startsWith("-") ? -1 : 1;
      const fieldName = field.replace("-", "");
      sortObj[fieldName] = order;
    });
  }

  const categories = await Category.find(query)
    .sort(sortObj)
    .limit(parseInt(limit));

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
      }),
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

export const getPaginatedCategories = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    search = "",
    sort = "sortOrder",
    order = "asc",
    parent = null,
    isActive = "true",
    featured,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  let query = {};

  if (isActive !== "all") {
    query.isActive = isActive === "true";
  }

  if (featured !== undefined) {
    query.featured = featured === "true";
  }

  if (parent !== undefined) {
    if (parent === "null" || parent === "root") {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }
  }

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  let sortObj = {};
  const sortOrderValue = order === "desc" ? -1 : 1;

  switch (sort) {
    case "name":
      sortObj.name = sortOrderValue;
      break;
    case "productCount":
      sortObj.productCount = sortOrderValue;
      break;
    case "createdAt":
      sortObj.createdAt = sortOrderValue;
      break;
    case "updatedAt":
      sortObj.updatedAt = sortOrderValue;
      break;
    case "sortOrder":
      sortObj.sortOrder = sortOrderValue;
      break;
    default:
      sortObj.sortOrder = 1;
  }

  const categories = await Category.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .populate("parent", "name slug");

  const total = await Category.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    count: categories.length,
    total,
    totalPages,
    currentPage: pageNum,
    data: categories,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
});

export const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404),
    );
  }

  let parentCategory = null;
  if (category.parent) {
    parentCategory = await Category.findById(category.parent).select(
      "name slug",
    );
  }

  const subcategories = await Category.find({
    parent: category._id,
    isActive: true,
  }).select("name slug description image productCount");

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

export const createCategory = asyncHandler(async (req, res, next) => {
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
  });

  if (existingCategory) {
    return next(
      new ErrorResponse(
        `Category with name "${req.body.name}" already exists`,
        400,
      ),
    );
  }

  if (req.body.parent) {
    const parentCategory = await Category.findById(req.body.parent);
    if (!parentCategory) {
      return next(new ErrorResponse("Parent category not found", 404));
    }

    if (req.body.parent === req.params.id) {
      return next(new ErrorResponse("Category cannot be its own parent", 400));
    }
  }

  if (req.file) {
    req.body.image = {
      url: req.file.path,
      publicId: req.file.filename,
      altText: req.body.imageAltText || req.body.name,
    };
  }

  if (!req.body.sortOrder) {
    const maxSortOrder = await Category.findOne()
      .sort("-sortOrder")
      .select("sortOrder");
    req.body.sortOrder = maxSortOrder ? maxSortOrder.sortOrder + 1 : 0;
  }

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404),
    );
  }

  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
      _id: { $ne: req.params.id },
    });

    if (existingCategory) {
      return next(
        new ErrorResponse(
          `Category with name "${req.body.name}" already exists`,
          400,
        ),
      );
    }
  }

  if (req.body.parent && req.body.parent !== category.parent?.toString()) {
    if (req.body.parent === req.params.id) {
      return next(new ErrorResponse("Category cannot be its own parent", 400));
    }

    const parentCategory = await Category.findById(req.body.parent);
    if (!parentCategory) {
      return next(new ErrorResponse("Parent category not found", 404));
    }

    const isDescendant = await checkDescendantCategories(
      req.body.parent,
      req.params.id,
    );
    if (isDescendant) {
      return next(
        new ErrorResponse("Cannot set a descendant category as parent", 400),
      );
    }
  }

  if (req.file) {
    req.body.image = {
      url: req.file.path,
      publicId: req.file.filename,
      altText: req.body.imageAltText || category.name,
    };
  } else if (req.body.removeImage === "true") {
    req.body.image = null;
  }

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

export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id ${req.params.id}`, 404),
    );
  }

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category with ${productCount} products. Remove products first or reassign them to another category.`,
        400,
      ),
    );
  }

  const subcategoryCount = await Category.countDocuments({
    parent: category._id,
  });
  if (subcategoryCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category with ${subcategoryCount} subcategories. Remove subcategories first.`,
        400,
      ),
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: {},
  });
});

export const uploadCategoryImage = upload.single("image");

export const processCategoryImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  req.body.image = {
    url: req.file.path,
    publicId: req.file.filename,
    altText: req.body.imageAltText || req.body.name,
  };

  next();
});

export const getCategoryTree = asyncHandler(async (req, res, next) => {
  const { includeProducts = "false", maxDepth = 3 } = req.query;

  const allCategories = await Category.find({
    isActive: true,
  }).sort("sortOrder");

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

  if (includeProducts === "true") {
    const enhancedTree = await Promise.all(
      categoryTree.map(async (category) => {
        const enhanceCategory = async (cat) => {
          const featuredProducts = await Product.find({
            category: cat._id,
            isActive: true,
            featured: true,
          })
            .select("name price images slug averageRating")
            .limit(4);

          const enhancedChildren = await Promise.all(
            cat.children.map((child) => enhanceCategory(child)),
          );

          return {
            ...cat,
            featuredProducts,
            children: enhancedChildren,
          };
        };

        return await enhanceCategory(category);
      }),
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

export const getCategoryWithProducts = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

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

  let productQuery = {
    category: category._id,
    isActive: true,
  };

  if (minPrice || maxPrice) {
    productQuery.price = {};
    if (minPrice) productQuery.price.$gte = Number(minPrice);
    if (maxPrice) productQuery.price.$lte = Number(maxPrice);
  }

  if (rating) {
    productQuery.averageRating = { $gte: Number(rating) };
  }

  if (inStock === "true") {
    productQuery.stock = { $gt: 0 };
  } else if (inStock === "false") {
    productQuery.stock = { $lte: 0 };
  }

  let sortObj = {};
  if (sort) {
    const sortFields = sort.split(",");
    sortFields.forEach((field) => {
      const order = field.startsWith("-") ? -1 : 1;
      const fieldName = field.replace("-", "");
      sortObj[fieldName] = order;
    });
  }

  const products = await Product.find(productQuery)
    .select("name price images slug category averageRating stock featured")
    .populate("category", "name slug")
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const totalProducts = await Product.countDocuments(productQuery);
  const totalPages = Math.ceil(totalProducts / limit);

  const subcategories = await Category.find({
    parent: category._id,
    isActive: true,
  }).select("name slug description image productCount");

  let parentCategory = null;
  if (category.parent) {
    parentCategory = await Category.findById(category.parent).select(
      "name slug",
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

export const getFeaturedCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const categories = await Category.find({
    featured: true,
    isActive: true,
    parent: null,
  })
    .select("name slug description image productCount")
    .sort("sortOrder")
    .limit(limit);

  const enhancedCategories = await Promise.all(
    categories.map(async (category) => {
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
    }),
  );

  res.status(200).json({
    success: true,
    count: enhancedCategories.length,
    data: enhancedCategories,
  });
});

export const toggleCategoryActive = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  if (category.isActive) {
    const activeProductCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    if (activeProductCount > 0) {
      return next(
        new ErrorResponse(
          `Cannot deactivate category with ${activeProductCount} active products. Deactivate products first or reassign them.`,
          400,
        ),
      );
    }

    await Category.updateMany({ parent: category._id }, { isActive: false });
  } else {
    if (category.parent) {
      const parentCategory = await Category.findById(category.parent);
      if (parentCategory && !parentCategory.isActive) {
        return next(
          new ErrorResponse(
            "Cannot activate category with inactive parent. Activate parent category first.",
            400,
          ),
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

export const updateCategoryOrder = asyncHandler(async (req, res, next) => {
  const { sortOrder, parent = null } = req.body;

  if (sortOrder === undefined) {
    return next(new ErrorResponse("sortOrder is required", 400));
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  category.sortOrder = parseInt(sortOrder);

  if (parent !== undefined) {
    if (parent === null || parent === "null") {
      category.parent = null;
    } else {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return next(new ErrorResponse("Parent category not found", 404));
      }
      category.parent = parent;
    }
  }

  await category.save();

  if (parent !== undefined) {
    await reorderCategories(category.parent);
  }

  res.status(200).json({
    success: true,
    message: "Category order updated successfully",
    data: category,
  });
});

export const getCategoryStats = asyncHandler(async (req, res, next) => {
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

  const topCategories = await Category.find({ isActive: true })
    .select("name slug productCount isActive featured")
    .sort("-productCount")
    .limit(10);

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

const checkDescendantCategories = async (parentId, childId) => {
  if (parentId === childId) return true;

  const parentCategory = await Category.findById(parentId);
  if (!parentCategory || !parentCategory.parent) return false;

  return checkDescendantCategories(parentCategory.parent, childId);
};

const reorderCategories = async (parentId = null) => {
  const categories = await Category.find({
    parent: parentId,
    isActive: true,
  }).sort("sortOrder");

  await Promise.all(
    categories.map(async (category, index) => {
      if (category.sortOrder !== index) {
        category.sortOrder = index;
        await category.save();
      }
    }),
  );
};
