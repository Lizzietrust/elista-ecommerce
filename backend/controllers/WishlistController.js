import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getWishlist = asyncHandler(async (req, res, next) => {
  const { populate = "true", sort = "-addedAt" } = req.query;

  let wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  if (populate === "true") {
    await wishlist.populate({
      path: "items.product",
      select:
        "name price images averageRating totalReviews stock isActive discountPercentage comparePrice brand category slug",
      populate: {
        path: "category",
        select: "name slug",
      },
    });

    wishlist.items = wishlist.items.filter(
      (item) => item.product && item.product.isActive !== false,
    );

    if (sort === "-addedAt") {
      wishlist.items.sort((a, b) => b.addedAt - a.addedAt);
    } else if (sort === "addedAt") {
      wishlist.items.sort((a, b) => a.addedAt - b.addedAt);
    } else if (sort === "price-asc") {
      wishlist.items.sort((a, b) => a.product.price - b.product.price);
    } else if (sort === "price-desc") {
      wishlist.items.sort((a, b) => b.product.price - a.product.price);
    } else if (sort === "name-asc") {
      wishlist.items.sort((a, b) =>
        a.product.name.localeCompare(b.product.name),
      );
    } else if (sort === "name-desc") {
      wishlist.items.sort((a, b) =>
        b.product.name.localeCompare(a.product.name),
      );
    } else if (sort === "rating") {
      wishlist.items.sort(
        (a, b) =>
          (b.product.averageRating || 0) - (a.product.averageRating || 0),
      );
    }
  }

  let totalEstimatedCost = 0;
  let inStockCount = 0;
  let outOfStockCount = 0;

  if (populate === "true") {
    wishlist.items.forEach((item) => {
      if (item.product && item.product.price) {
        totalEstimatedCost += item.product.price;
      }
      if (item.product && item.product.stock > 0) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      wishlist: {
        _id: wishlist._id,
        name: wishlist.name,
        itemCount: wishlist.items.length,
        isPublic: wishlist.isPublic,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
      },
      items: wishlist.items,
      summary: {
        totalItems: wishlist.items.length,
        totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2)),
        inStockCount,
        outOfStockCount,
        averageRating:
          wishlist.items.length > 0
            ? parseFloat(
                (
                  wishlist.items.reduce(
                    (sum, item) => sum + (item.product?.averageRating || 0),
                    0,
                  ) / wishlist.items.length
                ).toFixed(1),
              )
            : 0,
      },
    },
  });
});

export const addToWishlist = asyncHandler(async (req, res, next) => {
  const productId = req.body.product || req.body.productId;
  const { notes, priority, variant } = req.body;

  if (!productId) {
    return next(new ErrorResponse("Product ID is required", 400));
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    return next(new ErrorResponse("Product not found or not active", 404));
  }

  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  const alreadyInWishlist = wishlist.hasItem(productId);

  if (alreadyInWishlist) {
    return next(new ErrorResponse("Product already in wishlist", 400));
  }

  await wishlist.addItem(productId, { notes, priority, variant });

  await wishlist.populate({
    path: "items.product",
    match: { _id: productId },
    select: "name price images averageRating stock isActive",
  });

  const addedItem = wishlist.items.find(
    (item) => item.product && item.product._id.toString() === productId,
  );

  res.status(200).json({
    success: true,
    message: "Product added to wishlist",
    data: {
      item: addedItem,
      wishlist: {
        id: wishlist._id,
        itemCount: wishlist.items.length,
      },
    },
  });
});

export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  if (!wishlist.hasItem(productId)) {
    return next(new ErrorResponse("Product not found in wishlist", 404));
  }

  await wishlist.removeItem(productId);

  res.status(200).json({
    success: true,
    message: "Product removed from wishlist",
    data: {
      productId,
      wishlist: {
        id: wishlist._id,
        itemCount: wishlist.items.length,
      },
    },
  });
});

export const clearWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  if (wishlist.items.length === 0) {
    return next(new ErrorResponse("Wishlist is already empty", 400));
  }

  await wishlist.clear();

  res.status(200).json({
    success: true,
    message: "Wishlist cleared successfully",
    data: {
      wishlist: {
        id: wishlist._id,
        itemCount: 0,
      },
    },
  });
});

export const checkInWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);
  const isInWishlist = wishlist.hasItem(productId);

  let itemDetails = null;
  if (isInWishlist) {
    itemDetails = wishlist.getItem(productId);
  }

  res.status(200).json({
    success: true,
    data: {
      isInWishlist,
      itemDetails,
    },
  });
});

export const updateWishlistItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { notes, priority } = req.body;

  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  if (!wishlist.hasItem(productId)) {
    return next(new ErrorResponse("Product not found in wishlist", 404));
  }

  const itemIndex = wishlist.items.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex >= 0) {
    if (notes !== undefined) wishlist.items[itemIndex].notes = notes;
    if (priority !== undefined) wishlist.items[itemIndex].priority = priority;
    wishlist.items[itemIndex].addedAt = Date.now();

    await wishlist.save();
  }

  await wishlist.populate({
    path: "items.product",
    match: { _id: productId },
    select: "name price images",
  });

  const updatedItem = wishlist.items.find(
    (item) => item.product && item.product._id.toString() === productId,
  );

  res.status(200).json({
    success: true,
    message: "Wishlist item updated",
    data: {
      item: updatedItem,
    },
  });
});

export const moveToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  if (!wishlist.hasItem(productId)) {
    return next(new ErrorResponse("Product not found in wishlist", 404));
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
    stock: { $gte: quantity },
  });

  if (!product) {
    return next(
      new ErrorResponse("Product is out of stock or not available", 400),
    );
  }

  await wishlist.removeItem(productId);

  res.status(200).json({
    success: true,
    message: "Product moved to cart and removed from wishlist",
    data: {
      productId,
      movedToCart: true,
      wishlist: {
        id: wishlist._id,
        itemCount: wishlist.items.length,
      },
    },
  });
});

export const generateShareLink = asyncHandler(async (req, res, next) => {
  const { expiryDays = 7 } = req.body;

  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  if (wishlist.items.length === 0) {
    return next(new ErrorResponse("Cannot share empty wishlist", 400));
  }

  const token = await wishlist.generateShareToken(expiryDays);

  const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/wishlist/share/${token}`;

  res.status(200).json({
    success: true,
    message: "Share link generated",
    data: {
      shareUrl,
      token,
      expiresAt: wishlist.shareExpiresAt,
      expiryDays,
    },
  });
});

export const getSharedWishlist = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const wishlist = await Wishlist.findByShareToken(token);

  if (!wishlist) {
    return next(new ErrorResponse("Invalid or expired share link", 404));
  }

  const user = await User.findById(wishlist.user).select("name avatar");

  res.status(200).json({
    success: true,
    data: {
      wishlist: {
        id: wishlist._id,
        name: wishlist.name,
        itemCount: wishlist.items.length,
        createdAt: wishlist.createdAt,
        shareExpiresAt: wishlist.shareExpiresAt,
      },
      user: {
        name: user?.name,
        avatar: user?.avatar,
      },
      items: wishlist.items,
    },
  });
});

export const revokeShareLink = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  if (!wishlist.shareToken) {
    return next(new ErrorResponse("No active share link to revoke", 400));
  }

  await wishlist.revokeShareToken();

  res.status(200).json({
    success: true,
    message: "Share link revoked",
    data: {
      wishlist: {
        id: wishlist._id,
        isPublic: false,
      },
    },
  });
});

export const getWishlistCount = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      count: wishlist.items.length,
      isEmpty: wishlist.items.length === 0,
    },
  });
});

export const getRecentWishlistItems = asyncHandler(async (req, res, next) => {
  const { limit = 5 } = req.query;

  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  const recentItems = [...wishlist.items]
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, parseInt(limit));

  await wishlist.populate({
    path: "items.product",
    select: "name price images averageRating stock isActive",
  });

  const populatedItems = recentItems
    .map((item) => {
      const populatedItem = wishlist.items.find(
        (wishlistItem) =>
          wishlistItem.product &&
          wishlistItem.product._id.toString() === item.product.toString(),
      );
      return populatedItem || item;
    })
    .filter((item) => item.product);

  res.status(200).json({
    success: true,
    data: {
      items: populatedItems,
      count: populatedItems.length,
    },
  });
});

export const getWishlistStats = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.getOrCreateWishlist(req.user.id);

  if (wishlist.items.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        totalItems: 0,
        totalValue: 0,
        categories: {},
        priceRanges: {
          under50: 0,
          fiftyTo100: 0,
          hundredTo200: 0,
          over200: 0,
        },
        averageRating: 0,
        inStockCount: 0,
        outOfStockCount: 0,
      },
    });
  }

  await wishlist.populate({
    path: "items.product",
    select: "name price averageRating stock category",
    populate: {
      path: "category",
      select: "name",
    },
  });

  let totalValue = 0;
  const categories = {};
  const priceRanges = {
    under50: 0,
    fiftyTo100: 0,
    hundredTo200: 0,
    over200: 0,
  };
  let totalRating = 0;
  let ratedItems = 0;
  let inStockCount = 0;
  let outOfStockCount = 0;

  wishlist.items.forEach((item) => {
    if (item.product) {
      totalValue += item.product.price || 0;

      const categoryName = item.product.category?.name || "Uncategorized";
      categories[categoryName] = (categories[categoryName] || 0) + 1;

      const price = item.product.price || 0;
      if (price < 50) priceRanges.under50++;
      else if (price < 100) priceRanges.fiftyTo100++;
      else if (price < 200) priceRanges.hundredTo200++;
      else priceRanges.over200++;

      if (item.product.averageRating > 0) {
        totalRating += item.product.averageRating;
        ratedItems++;
      }

      if (item.product.stock > 0) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalItems: wishlist.items.length,
      totalValue: parseFloat(totalValue.toFixed(2)),
      categories,
      priceRanges,
      averageRating:
        ratedItems > 0 ? parseFloat((totalRating / ratedItems).toFixed(1)) : 0,
      inStockCount,
      outOfStockCount,
    },
  });
});
