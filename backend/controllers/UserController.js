import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select("-password -resetPasswordToken -resetPasswordExpire")
    .populate({
      path: "wishlist",
      select: "name price images category slug",
    })
    .populate({
      path: "recentlyViewed",
      select: "name price images category slug",
      options: { limit: 10 },
    })
    .populate({
      path: "cart.items.product",
      select: "name price images category slug stock",
    });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Get user stats
  const orderStats = await Order.aggregate([
    { $match: { user: req.user.id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$totalPrice" },
        avgOrderValue: { $avg: "$totalPrice" },
      },
    },
  ]);

  const stats = orderStats[0] || {
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
  };

  res.status(200).json({
    success: true,
    data: {
      user,
      stats,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, phone, dateOfBirth, gender } = req.body;

  // Create update object
  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (phone) updateFields.phone = phone;
  if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
  if (gender) updateFields.gender = gender;

  // If email is being updated, need to verify it
  if (email && email !== req.user.email) {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return next(new ErrorResponse("Email already in use", 400));
    }

    // Set email as unverified and generate verification token
    updateFields.isEmailVerified = false;
    updateFields.emailVerificationToken = crypto
      .createHash("sha256")
      .update(crypto.randomBytes(20).toString("hex"))
      .digest("hex");
    updateFields.emailVerificationTokenExpiry =
      Date.now() + 24 * 60 * 60 * 1000;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    message:
      email && email !== req.user.email
        ? "Profile updated. Please verify your new email."
        : "Profile updated successfully",
    data: user,
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  let query = {};

  // Search by name or email
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }

  // Filter by active status
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === "true";
  }

  // Filter by email verification
  if (req.query.isEmailVerified !== undefined) {
    query.isEmailVerified = req.query.isEmailVerified === "true";
  }

  // Execute query
  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages,
    currentPage: page,
    data: users,
  });
});

// @desc    Get single user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("-password -resetPasswordToken -resetPasswordExpire")
    .populate({
      path: "wishlist",
      select: "name price images category",
    });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  // Get user's order stats
  const orderStats = await Order.aggregate([
    { $match: { user: req.params.id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$totalPrice" },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
      },
    },
  ]);

  const stats = orderStats[0] || {
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
    pendingOrders: 0,
  };

  res.status(200).json({
    success: true,
    data: {
      user,
      stats,
    },
  });
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!["user", "admin", "seller"].includes(role)) {
    return next(new ErrorResponse("Invalid role specified", 400));
  }

  // Don't allow changing own role
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse("Cannot change your own role", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    data: user,
  });
});

// @desc    Deactivate user (Admin only)
// @route   PATCH /api/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = asyncHandler(async (req, res, next) => {
  // Don't allow deactivating yourself
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse("Cannot deactivate your own account", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select("-password");

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: "User account deactivated",
    data: user,
  });
});

// @desc    Activate user (Admin only)
// @route   PATCH /api/users/:id/activate
// @access  Private/Admin
export const activateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  ).select("-password");

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: "User account activated",
    data: user,
  });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  // Don't allow deleting yourself
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse("Cannot delete your own account", 400));
  }

  // Check if user has any orders before deleting
  const userOrders = await Order.find({ user: req.params.id });

  if (userOrders.length > 0) {
    // Instead of deleting, deactivate the account
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message:
        "User has existing orders. Account deactivated instead of deleted.",
      data: user,
    });
  }

  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: {},
  });
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ["$isActive", 1, 0] } },
        verifiedUsers: { $sum: { $cond: ["$isEmailVerified", 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
        sellerUsers: { $sum: { $cond: [{ $eq: ["$role", "seller"] }, 1, 0] } },
        regularUsers: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        totalUsers: 1,
        activeUsers: 1,
        inactiveUsers: { $subtract: ["$totalUsers", "$activeUsers"] },
        verifiedUsers: 1,
        unverifiedUsers: { $subtract: ["$totalUsers", "$verifiedUsers"] },
        adminUsers: 1,
        sellerUsers: 1,
        regularUsers: 1,
      },
    },
  ]);

  // Get new users per month for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const newUsersByMonth = await User.aggregate([
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
      overview: stats[0] || {},
      monthlyGrowth: newUsersByMonth,
    },
  });
});

// @desc    Get user's orders
// @route   GET /api/users/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = { user: req.user.id };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const orders = await Order.find(query)
    .populate({
      path: "orderItems.product",
      select: "name price images",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    totalPages,
    currentPage: page,
    data: orders,
  });
});

// @desc    Get user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "wishlist",
    select: "name price images category slug stock isActive averageRating",
  });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Filter out inactive products
  const activeWishlist = user.wishlist.filter((product) => product.isActive);

  res.status(200).json({
    success: true,
    count: activeWishlist.length,
    data: activeWishlist,
  });
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
export const addToWishlist = asyncHandler(async (req, res, next) => {
  // Check if product exists and is active
  const product = await Product.findById(req.params.productId);
  if (!product || !product.isActive) {
    return next(new ErrorResponse("Product not found or inactive", 404));
  }

  const user = await User.findById(req.user.id);

  // Check if product is already in wishlist
  if (user.wishlist.includes(req.params.productId)) {
    return next(new ErrorResponse("Product already in wishlist", 400));
  }

  // Add to wishlist
  user.wishlist.push(req.params.productId);
  await user.save();

  // Populate product details for response
  await user.populate({
    path: "wishlist",
    select: "name price images category slug",
  });

  res.status(200).json({
    success: true,
    message: "Product added to wishlist",
    data: user.wishlist,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Check if product is in wishlist
  if (!user.wishlist.includes(req.params.productId)) {
    return next(new ErrorResponse("Product not in wishlist", 404));
  }

  // Remove from wishlist
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== req.params.productId
  );
  await user.save();

  // Populate product details for response
  await user.populate({
    path: "wishlist",
    select: "name price images category slug",
  });

  res.status(200).json({
    success: true,
    message: "Product removed from wishlist",
    data: user.wishlist,
  });
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updateUserPreferences = asyncHandler(async (req, res, next) => {
  const { newsletter, marketingEmails, currency, language } = req.body;

  const updateFields = {};
  if (newsletter !== undefined)
    updateFields["preferences.newsletter"] = newsletter;
  if (marketingEmails !== undefined)
    updateFields["preferences.marketingEmails"] = marketingEmails;
  if (currency) updateFields["preferences.currency"] = currency;
  if (language) updateFields["preferences.language"] = language;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "Preferences updated successfully",
    data: user.preferences,
  });
});

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
export const getUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("addresses");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Migrate legacy address if needed
  if (user.addresses.length === 0 && user.address && user.address.street) {
    await user.migrateLegacyAddress();
    await user.save();
  }

  res.status(200).json({
    success: true,
    count: user.addresses.length,
    data: user.addresses,
  });
});

// @desc    Add user address
// @route   POST /api/users/addresses
// @access  Private
export const addUserAddress = asyncHandler(async (req, res, next) => {
  const {
    street,
    city,
    state,
    zipCode,
    country,
    addressType,
    isDefault,
    phone,
    fullName,
  } = req.body;

  if (!street || !city || !state || !zipCode || !country) {
    return next(
      new ErrorResponse("Please provide all required address fields", 400)
    );
  }

  const user = await User.findById(req.user.id);

  try {
    await user.addAddress({
      street,
      city,
      state,
      zipCode,
      country,
      addressType,
      isDefault,
      phone,
      fullName,
    });

    // Refresh user data
    await user.populate("addresses");

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: user.addresses,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Update user address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
export const updateUserAddress = asyncHandler(async (req, res, next) => {
  const {
    street,
    city,
    state,
    zipCode,
    country,
    addressType,
    isDefault,
    phone,
    fullName,
  } = req.body;

  const user = await User.findById(req.user.id);

  try {
    await user.updateAddress(req.params.addressId, {
      street,
      city,
      state,
      zipCode,
      country,
      addressType,
      isDefault,
      phone,
      fullName,
    });

    // Refresh user data
    await user.populate("addresses");

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: user.addresses,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Delete user address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
export const deleteUserAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  try {
    await user.deleteAddress(req.params.addressId);

    // Refresh user data
    await user.populate("addresses");

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: user.addresses,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Set default address
// @route   PATCH /api/users/addresses/:addressId/default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  try {
    await user.setDefaultAddress(req.params.addressId);

    // Refresh user data
    await user.populate("addresses");

    res.status(200).json({
      success: true,
      message: "Address set as default",
      data: user.addresses,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc    Get default address
// @route   GET /api/users/addresses/default
// @access  Private
export const getDefaultAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const defaultAddress = user.getDefaultAddress();

  res.status(200).json({
    success: true,
    data: defaultAddress,
  });
});
