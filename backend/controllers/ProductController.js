import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

// Removed the problematic import from index.js
// We'll define this directly or import from where upload is actually defined

// Helper function to build product query
const buildProductQuery = (queryParams, userId = null) => {
  const {
    category,
    minPrice,
    maxPrice,
    rating,
    inStock,
    featured,
    seller,
    search,
    sort = "-createdAt",
    page = 1,
    limit = 12,
  } = queryParams;

  let query = { isActive: true };

  // Category filter
  if (category) {
    if (Array.isArray(category)) {
      query.category = { $in: category };
    } else {
      query.category = category;
    }
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) {
    query.averageRating = { $gte: Number(rating) };
  }

  // Stock filter
  if (inStock !== undefined) {
    if (inStock === "true" || inStock === true) {
      query.stock = { $gt: 0 };
    } else if (inStock === "false" || inStock === false) {
      query.stock = { $lte: 0 };
    }
  }

  // Featured filter
  if (featured !== undefined) {
    query.featured = featured === "true" || featured === true;
  }

  // Seller filter (for admin/seller view)
  if (seller) {
    query.seller = seller;
  }

  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
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

  return { query, sort: sortObj, page: parseInt(page), limit: parseInt(limit) };
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = asyncHandler(async (req, res, next) => {
  const { query, sort, page, limit } = buildProductQuery(
    req.query,
    req.user?.id,
  );

  const skip = (page - 1) * limit;

  // Execute query with pagination
  const products = await Product.find(query)
    .populate("category", "name slug")
    .populate("seller", "name email")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Add to recently viewed for authenticated users
  if (req.user && products.length > 0) {
    const user = req.user;
    products.forEach((product) => {
      user.addToRecentlyViewed(product._id);
    });
  }

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages,
    currentPage: page,
    data: products,
    filters: {
      ...req.query,
      sort: Object.keys(sort)
        .map((key) => `${sort[key] === -1 ? "-" : ""}${key}`)
        .join(","),
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug description")
    .populate("seller", "name email phone")
    .populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "name email",
      },
      options: { sort: { createdAt: -1 }, limit: 10 },
    });

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id ${req.params.id}`, 404),
    );
  }

  // Check if product is active (unless admin/seller is viewing)
  if (
    !product.isActive &&
    (!req.user || (req.user.role !== "admin" && req.user.role !== "seller"))
  ) {
    return next(new ErrorResponse("Product is not available", 404));
  }

  // Add to recently viewed for authenticated users
  if (req.user) {
    const user = req.user;
    await user.addToRecentlyViewed(product._id);
  }

  // Get related products
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .select("name price images slug averageRating")
    .limit(4);

  res.status(200).json({
    success: true,
    data: {
      product,
      relatedProducts,
    },
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin/Seller
export const createProduct = asyncHandler(async (req, res, next) => {
  // Set seller to current user (if seller role)
  if (req.user.role === "seller" && !req.body.seller) {
    req.body.seller = req.user.id;
  }

  // Check if seller is trying to create product for someone else
  if (
    req.user.role === "seller" &&
    req.body.seller &&
    req.body.seller !== req.user.id
  ) {
    return next(
      new ErrorResponse("Sellers can only create products for themselves", 403),
    );
  }

  // Validate category exists
  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return next(new ErrorResponse("Category not found", 404));
    }
  }

  // Handle uploaded images
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((file) => file.path);
  }

  // Generate SKU if not provided
  if (!req.body.sku) {
    const namePrefix = req.body.name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    req.body.sku = `${namePrefix}-${randomNum}`;
  }

  // Create product
  const product = await Product.create(req.body);

  // Update category product count
  if (product.category) {
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: 1 },
    });
  }

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin/Seller
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id ${req.params.id}`, 404),
    );
  }

  // Check permissions
  if (req.user.role === "seller" && product.seller.toString() !== req.user.id) {
    return next(
      new ErrorResponse("Not authorized to update this product", 403),
    );
  }

  // Handle uploaded images
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((file) => file.path);

    // Delete old images from Cloudinary if needed
    // Note: You might want to implement image cleanup logic here
  }

  // Handle category change
  if (req.body.category && req.body.category !== product.category.toString()) {
    // Decrement old category count
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 },
    });

    // Increment new category count
    await Category.findByIdAndUpdate(req.body.category, {
      $inc: { productCount: 1 },
    });

    // Validate new category exists
    const newCategory = await Category.findById(req.body.category);
    if (!newCategory) {
      return next(new ErrorResponse("New category not found", 404));
    }
  }

  // Update product
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category", "name slug");

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin/Seller
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id ${req.params.id}`, 404),
    );
  }

  // Check permissions
  if (req.user.role === "seller" && product.seller.toString() !== req.user.id) {
    return next(
      new ErrorResponse("Not authorized to delete this product", 403),
    );
  }

  // Check if product has orders
  // Need to import Order model if you're using it
  // const hasOrders = await Order.exists({ "orderItems.product": product._id });
  // For now, we'll skip this check since Order model might not be imported
  const hasOrders = false; // Temporary fix

  if (hasOrders) {
    // Soft delete by marking as inactive
    product.isActive = false;
    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product has existing orders. Product has been deactivated instead of deleted.",
      data: product,
    });
  }

  // Delete product images from Cloudinary
  if (product.images && product.images.length > 0) {
    // You would implement Cloudinary deletion logic here
    // For example:
    // await Promise.all(product.images.map(image => cloudinary.uploader.destroy(image)))
  }

  // Remove product from category count
  if (product.category) {
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 },
    });
  }

  // Delete product reviews
  await Review.deleteMany({ product: product._id });

  // Delete the product
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: {},
  });
});

// REMOVED the problematic export - moved to a separate file or define inline
// export const uploadProductImages = upload.array("images", 10); // Max 10 images

// @desc    Process product images middleware
// @route   Middleware
// @access  Private
export const processProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  // Add image URLs to req.body
  req.body.images = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
    thumbnail: file.path.replace("/upload/", "/upload/w_300,h_300,c_fill/"),
  }));

  next();
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    featured: true,
    isActive: true,
    stock: { $gt: 0 },
  })
    .select("name price images slug category averageRating featured")
    .populate("category", "name slug")
    .limit(limit)
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const { query, sort, page, limit } = buildProductQuery(req.query);

  query.category = categoryId;
  const skip = (page - 1) * limit;

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new ErrorResponse("Category not found", 404));
  }

  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages,
    currentPage: page,
    data: products,
    category: {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
    },
  });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 12;
  const daysAgo = parseInt(req.query.days) || 30;

  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

  const products = await Product.find({
    createdAt: { $gte: dateThreshold },
    isActive: true,
  })
    .select("name price images slug category averageRating createdAt")
    .populate("category", "name slug")
    .sort("-createdAt")
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellers = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 12;

  // This requires order tracking - for now, we'll use products with highest rating and salesCount
  const products = await Product.find({
    isActive: true,
    stock: { $gt: 0 },
  })
    .select("name price images slug category averageRating salesCount")
    .populate("category", "name slug")
    .sort("-salesCount -averageRating")
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res, next) => {
  const { q: searchTerm, limit = 20 } = req.query;

  if (!searchTerm || searchTerm.trim() === "") {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      suggestions: [],
    });
  }

  // Search in multiple fields
  const searchQuery = {
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { brand: { $regex: searchTerm, $options: "i" } },
      { sku: { $regex: searchTerm, $options: "i" } },
      { tags: { $regex: searchTerm, $options: "i" } },
    ],
    isActive: true,
  };

  const products = await Product.find(searchQuery)
    .select("name price images slug category brand averageRating")
    .populate("category", "name slug")
    .limit(parseInt(limit));

  // Get search suggestions
  const suggestions = await Product.aggregate([
    {
      $match: {
        name: { $regex: searchTerm, $options: "i" },
        isActive: true,
      },
    },
    {
      $project: {
        name: 1,
        category: 1,
        _id: 0,
      },
    },
    {
      $group: {
        _id: "$name",
        category: { $first: "$category" },
      },
    },
    {
      $limit: 5,
    },
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
    suggestions: suggestions.map((s) => s._id),
  });
});

// @desc    Get related products
// @route   GET /api/products/related/:productId
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  const limit = parseInt(req.query.limit) || 4;

  const relatedProducts = await Product.find({
    $or: [
      { category: product.category },
      { brand: product.brand },
      { tags: { $in: product.tags } },
    ],
    _id: { $ne: product._id },
    isActive: true,
    stock: { $gt: 0 },
  })
    .select("name price images slug averageRating")
    .limit(limit);

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    data: relatedProducts,
  });
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin/Seller
export const updateProductStock = asyncHandler(async (req, res, next) => {
  const { operation, quantity } = req.body; // operation: 'add', 'subtract', 'set'
  const productId = req.params.id;

  if (!["add", "subtract", "set"].includes(operation)) {
    return next(
      new ErrorResponse(
        "Invalid operation. Use 'add', 'subtract', or 'set'",
        400,
      ),
    );
  }

  if (!quantity && operation !== "set") {
    return next(new ErrorResponse("Quantity is required", 400));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  // Check permissions for sellers
  if (req.user.role === "seller" && product.seller.toString() !== req.user.id) {
    return next(
      new ErrorResponse("Not authorized to update this product", 403),
    );
  }

  let newStock;
  switch (operation) {
    case "add":
      newStock = product.stock + parseInt(quantity);
      break;
    case "subtract":
      newStock = product.stock - parseInt(quantity);
      if (newStock < 0) newStock = 0;
      break;
    case "set":
      newStock = parseInt(quantity) >= 0 ? parseInt(quantity) : 0;
      break;
  }

  product.stock = newStock;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Stock updated successfully. New stock: ${newStock}`,
    data: {
      productId: product._id,
      name: product.name,
      previousStock:
        product.stock -
        (operation === "add"
          ? -parseInt(quantity)
          : operation === "subtract"
            ? parseInt(quantity)
            : 0),
      newStock,
      operation,
    },
  });
});

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle-active
// @access  Private/Admin/Seller
export const toggleProductActive = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  // Check permissions for sellers
  if (req.user.role === "seller" && product.seller.toString() !== req.user.id) {
    return next(
      new ErrorResponse("Not authorized to update this product", 403),
    );
  }

  product.isActive = !product.isActive;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${
      product.isActive ? "activated" : "deactivated"
    } successfully`,
    data: {
      productId: product._id,
      name: product.name,
      isActive: product.isActive,
    },
  });
});

// @desc    Get products by seller
// @route   GET /api/products/seller/my-products
// @access  Private/Seller/Admin
export const getProductsBySeller = asyncHandler(async (req, res, next) => {
  const { query, sort, page, limit } = buildProductQuery(
    req.query,
    req.user.id,
  );

  query.seller = req.user.id;
  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Get seller stats
  const stats = await Product.aggregate([
    { $match: { seller: req.user.id } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: { $sum: { $cond: ["$isActive", 1, 0] } },
        totalStock: { $sum: "$stock" },
        averagePrice: { $avg: "$price" },
        totalSales: { $sum: "$salesCount" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages,
    currentPage: page,
    data: products,
    stats: stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      totalStock: 0,
      averagePrice: 0,
      totalSales: 0,
    },
  });
});

// @desc    Get product statistics (Admin only)
// @route   GET /api/products/stats/overview
// @access  Private/Admin
export const getProductStats = asyncHandler(async (req, res, next) => {
  const { timeRange = "month" } = req.query; // day, week, month, year

  const timeRanges = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };

  const days = timeRanges[timeRange] || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get basic stats
  const stats = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: { $sum: { $cond: ["$isActive", 1, 0] } },
        outOfStock: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } },
        lowStock: {
          $sum: {
            $cond: [
              { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 10] }] },
              1,
              0,
            ],
          },
        },
        averagePrice: { $avg: "$price" },
        totalStock: { $sum: "$stock" },
        totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
      },
    },
  ]);

  // Get new products over time
  const newProducts = await Product.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
          },
        },
        count: 1,
      },
    },
  ]);

  // Get products by category
  const byCategory = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalStock: { $sum: "$stock" },
        averagePrice: { $avg: "$price" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: "$categoryInfo",
    },
    {
      $project: {
        _id: 0,
        categoryId: "$_id",
        categoryName: "$categoryInfo.name",
        count: 1,
        totalStock: 1,
        averagePrice: { $round: ["$averagePrice", 2] },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: stats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        outOfStock: 0,
        lowStock: 0,
        averagePrice: 0,
        totalStock: 0,
        totalValue: 0,
      },
      timeRange: {
        name: timeRange,
        days,
        startDate,
        endDate: new Date(),
      },
      newProducts,
      byCategory,
    },
  });
});

// @desc    Bulk update products
// @route   POST /api/products/bulk-update
// @access  Private/Admin
export const bulkUpdateProducts = asyncHandler(async (req, res, next) => {
  const { productIds, updateData, operation } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return next(new ErrorResponse("Please provide product IDs", 400));
  }

  if (!updateData || typeof updateData !== "object") {
    return next(new ErrorResponse("Please provide update data", 400));
  }

  // Validate product IDs
  const validProductIds = await Product.find({
    _id: { $in: productIds },
  }).select("_id");

  if (validProductIds.length !== productIds.length) {
    return next(new ErrorResponse("Some product IDs are invalid", 400));
  }

  // Perform bulk update
  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    updateData,
    { runValidators: true },
  );

  res.status(200).json({
    success: true,
    message: `Updated ${result.modifiedCount} products successfully`,
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      productIds,
    },
  });
});
