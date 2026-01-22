import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    product,
    user,
    rating,
    sort = "-createdAt",
    verified = false,
  } = req.query;

  // Build query
  const query = {};

  if (product) {
    query.product = product;
  }

  if (user) {
    query.user = user;
  }

  if (rating) {
    query.rating = parseInt(rating);
  }

  if (verified === "true") {
    query.verifiedPurchase = true;
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get reviews with populated data
  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate("user", "name avatar")
      .populate("product", "name images")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Review.countDocuments(query),
  ]);

  // Calculate average rating if product specified
  let averageRating = null;
  let ratingCounts = null;

  if (product) {
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(product) } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingCounts: {
            $push: "$rating",
          },
        },
      },
    ]);

    if (stats.length > 0) {
      averageRating = stats[0].averageRating.toFixed(1);

      // Count ratings (1-5)
      ratingCounts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      stats[0].ratingCounts.forEach((rating) => {
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
      });
    }
  }

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
    averageRating,
    ratingCounts,
    data: reviews,
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "name avatar email")
    .populate("product", "name images price");

  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res, next) => {
  const { product, rating, comment, title, images = [] } = req.body;

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    return next(new ErrorResponse("Product not found", 404));
  }

  // Check if user has purchased the product
  const hasPurchased = await Order.findOne({
    user: req.user.id,
    "items.product": product,
    orderStatus: "delivered",
  });

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user.id,
    product,
  });

  if (existingReview) {
    return next(
      new ErrorResponse("You have already reviewed this product", 400),
    );
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    return next(new ErrorResponse("Rating must be between 1 and 5", 400));
  }

  // Create review
  const review = await Review.create({
    user: req.user.id,
    product,
    rating,
    comment,
    title,
    images,
    verifiedPurchase: !!hasPurchased,
  });

  // Populate user and product data
  const populatedReview = await Review.findById(review._id)
    .populate("user", "name avatar")
    .populate("product", "name images");

  // Update product rating
  await updateProductRating(product);

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: populatedReview,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }

  // Check ownership or admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to update this review", 403));
  }

  // Check if review is editable (within 24 hours of creation)
  const hoursSinceCreation = (Date.now() - review.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24 && req.user.role !== "admin") {
    return next(
      new ErrorResponse("Review can only be edited within 24 hours", 400),
    );
  }

  // Update fields
  const { rating, comment, title, images, isHelpful, isNotHelpful } = req.body;

  // Update rating if provided
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      return next(new ErrorResponse("Rating must be between 1 and 5", 400));
    }
    review.rating = rating;
  }

  // Update text fields
  if (comment !== undefined) review.comment = comment;
  if (title !== undefined) review.title = title;
  if (images !== undefined) review.images = images;

  // Update helpful counts
  if (isHelpful === true) {
    if (!review.helpfulBy.includes(req.user.id)) {
      review.helpfulBy.push(req.user.id);
      review.helpfulCount += 1;
    }
  } else if (isHelpful === false) {
    const index = review.helpfulBy.indexOf(req.user.id);
    if (index > -1) {
      review.helpfulBy.splice(index, 1);
      review.helpfulCount -= 1;
    }
  }

  if (isNotHelpful === true) {
    if (!review.notHelpfulBy.includes(req.user.id)) {
      review.notHelpfulBy.push(req.user.id);
      review.notHelpfulCount += 1;
    }
  } else if (isNotHelpful === false) {
    const index = review.notHelpfulBy.indexOf(req.user.id);
    if (index > -1) {
      review.notHelpfulBy.splice(index, 1);
      review.notHelpfulCount -= 1;
    }
  }

  // Mark as edited
  review.edited = true;
  review.editedAt = Date.now();

  await review.save();

  // Update product rating
  await updateProductRating(review.product);

  // Populate user and product data
  const populatedReview = await Review.findById(review._id)
    .populate("user", "name avatar")
    .populate("product", "name images");

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: populatedReview,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }

  // Check ownership or admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to delete this review", 403));
  }

  const productId = review.product;

  await review.deleteOne();

  // Update product rating
  await updateProductRating(productId);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// @desc    Get reviews by product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    rating,
    sort = "-createdAt",
    verified = false,
    hasImages = false,
  } = req.query;

  const productId = req.params.productId;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  // Build query
  const query = { product: productId };

  if (rating) {
    query.rating = parseInt(rating);
  }

  if (verified === "true") {
    query.verifiedPurchase = true;
  }

  if (hasImages === "true") {
    query.images = { $exists: true, $ne: [] };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get reviews with user data
  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate("user", "name avatar")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Review.countDocuments(query),
  ]);

  // Get rating statistics
  const ratingStats = await Review.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  let averageRating = 0;
  let totalReviews = 0;
  let ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  if (ratingStats.length > 0) {
    averageRating = ratingStats[0].averageRating.toFixed(1);
    totalReviews = ratingStats[0].totalReviews;

    // Calculate distribution
    ratingStats[0].ratingDistribution.forEach((rating) => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    // Calculate percentages
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = {
        count: ratingDistribution[i],
        percentage: Math.round((ratingDistribution[i] / totalReviews) * 100),
      };
    }
  }

  res.status(200).json({
    success: true,
    product: {
      id: product._id,
      name: product.name,
      images: product.images,
    },
    statistics: {
      averageRating,
      totalReviews,
      ratingDistribution,
    },
    count: reviews.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
    data: reviews,
  });
});

// @desc    Get reviews by user
// @route   GET /api/reviews/user/:userId
// @access  Private/Admin or Self
export const getUserReviews = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  const { page = 1, limit = 10 } = req.query;

  // Check if user exists
  const user = await User.findById(userId).select("name email avatar");
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Check authorization (admin or self)
  if (userId !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized", 403));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ user: userId })
      .populate("product", "name images price")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Review.countDocuments({ user: userId }),
  ]);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
    },
    count: reviews.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
    data: reviews,
  });
});

// @desc    Get my reviews
// @route   GET /api/reviews/me
// @access  Private
export const getMyReviews = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ user: req.user.id })
      .populate("product", "name images price")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Review.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
    data: reviews,
  });
});

// @desc    Report a review
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = asyncHandler(async (req, res, next) => {
  const { reason, description } = req.body;

  if (!reason) {
    return next(
      new ErrorResponse("Please provide a reason for reporting", 400),
    );
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }

  // Check if user already reported
  const existingReport = review.reports.find(
    (report) => report.user.toString() === req.user.id,
  );

  if (existingReport) {
    return next(
      new ErrorResponse("You have already reported this review", 400),
    );
  }

  // Add report
  review.reports.push({
    user: req.user.id,
    reason,
    description,
    reportedAt: Date.now(),
  });

  // If multiple reports, mark for review
  if (review.reports.length >= 3) {
    review.status = "flagged";
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: "Review reported successfully",
    data: {
      reportCount: review.reports.length,
      status: review.status,
    },
  });
});

// @desc    Get recent reviews
// @route   GET /api/reviews/recent
// @access  Public
export const getRecentReviews = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const reviews = await Review.find({})
    .populate("user", "name avatar")
    .populate("product", "name images")
    .sort("-createdAt")
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Get helpful reviews
// @route   GET /api/reviews/helpful
// @access  Public
export const getHelpfulReviews = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const reviews = await Review.find({})
    .populate("user", "name avatar")
    .populate("product", "name images")
    .sort("-helpfulCount")
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: stats[0].averageRating.toFixed(1),
        numReviews: stats[0].numReviews,
      });
    } else {
      // No reviews, reset rating
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0,
      });
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};
