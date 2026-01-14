import Product from "../models/Product.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import {
  calculateDiscount,
  calculateShipping,
  calculateTax,
} from "../utils/cartCalculations.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res, next) => {
  // Since we're storing cart in User model, get user with populated cart
  const user = await User.findById(req.user.id)
    .populate({
      path: "cart.items.product",
      select: "name price images slug stock isActive",
      populate: {
        path: "category",
        select: "name slug",
      },
    })
    .select("cart");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Filter out inactive or deleted products
  const validCartItems = user.cart.items.filter(
    (item) => item.product && item.product.isActive
  );

  // Calculate totals
  const subtotal = validCartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  // Apply coupon if exists
  let discount = 0;
  let total = subtotal;

  if (user.cart.coupon) {
    const coupon = await Coupon.findById(user.cart.coupon);
    if (coupon && coupon.isActive) {
      discount = calculateDiscount(subtotal, coupon);
      total = subtotal - discount;
    }
  }

  // Add shipping cost
  const shippingCost = calculateShipping(validCartItems);
  total += shippingCost;

  // Add tax
  const tax = calculateTax(total);
  total += tax;

  res.status(200).json({
    success: true,
    data: {
      items: validCartItems,
      summary: {
        subtotal,
        discount,
        shipping: shippingCost,
        tax,
        total,
        itemCount: validCartItems.reduce((sum, item) => sum + item.quantity, 0),
        coupon: user.cart.coupon || null,
      },
    },
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  // Validate product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new ErrorResponse("Product not found or inactive", 404));
  }

  // Check stock availability
  if (product.stock < quantity) {
    return next(
      new ErrorResponse(
        `Insufficient stock. Only ${product.stock} items available`,
        400
      )
    );
  }

  const user = await User.findById(req.user.id);

  // Check if product is already in cart
  const existingItemIndex = user.cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex >= 0) {
    // Update quantity if product already in cart
    const newQuantity = user.cart.items[existingItemIndex].quantity + quantity;

    // Check stock for updated quantity
    if (product.stock < newQuantity) {
      return next(
        new ErrorResponse(
          `Insufficient stock for updated quantity. Only ${product.stock} items available`,
          400
        )
      );
    }

    user.cart.items[existingItemIndex].quantity = newQuantity;
    user.cart.items[existingItemIndex].addedAt = Date.now();
  } else {
    // Add new item to cart
    user.cart.items.push({
      product: productId,
      quantity,
      addedAt: Date.now(),
    });
  }

  user.cart.updatedAt = Date.now();
  await user.save();

  // Get updated cart with populated products
  await user.populate({
    path: "cart.items.product",
    select: "name price images slug",
  });

  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    data: {
      items: user.cart.items,
      itemCount: user.cart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity, productId } = req.body;

  const user = await User.findById(req.user.id);

  // Find item in cart
  const itemIndex = user.cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse("Item not found in cart", 404));
  }

  // If productId is provided, check if it's different from current product
  if (
    productId &&
    productId !== user.cart.items[itemIndex].product.toString()
  ) {
    // Validate new product
    const newProduct = await Product.findById(productId);
    if (!newProduct || !newProduct.isActive) {
      return next(new ErrorResponse("New product not found or inactive", 404));
    }

    // Check stock for new product
    if (newProduct.stock < quantity) {
      return next(
        new ErrorResponse(
          `Insufficient stock for new product. Only ${newProduct.stock} items available`,
          400
        )
      );
    }

    user.cart.items[itemIndex].product = productId;
  } else {
    // Validate current product stock if quantity is being updated
    if (quantity !== undefined) {
      const currentProduct = await Product.findById(
        user.cart.items[itemIndex].product
      );

      if (!currentProduct || !currentProduct.isActive) {
        return next(new ErrorResponse("Product not found or inactive", 404));
      }

      if (currentProduct.stock < quantity) {
        return next(
          new ErrorResponse(
            `Insufficient stock. Only ${currentProduct.stock} items available`,
            400
          )
        );
      }
    }
  }

  // Update quantity if provided
  if (quantity !== undefined) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      user.cart.items.splice(itemIndex, 1);
    } else {
      user.cart.items[itemIndex].quantity = quantity;
    }
  }

  user.cart.updatedAt = Date.now();
  await user.save();

  // Get updated cart with populated products
  await user.populate({
    path: "cart.items.product",
    select: "name price images slug",
  });

  res.status(200).json({
    success: true,
    message: "Cart item updated successfully",
    data: {
      items: user.cart.items,
      itemCount: user.cart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

// @desc    Update cart item quantity
// @route   PATCH /api/cart/:itemId/quantity
// @access  Private
export const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity, operation } = req.body; // operation: 'increment', 'decrement', 'set'

  if (!quantity && operation !== "increment" && operation !== "decrement") {
    return next(
      new ErrorResponse(
        "Please provide quantity or specify operation (increment/decrement)",
        400
      )
    );
  }

  const user = await User.findById(req.user.id);

  // Find item in cart
  const itemIndex = user.cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse("Item not found in cart", 404));
  }

  const cartItem = user.cart.items[itemIndex];
  let newQuantity = cartItem.quantity;

  // Calculate new quantity based on operation
  if (operation === "increment") {
    newQuantity += 1;
  } else if (operation === "decrement") {
    newQuantity -= 1;
  } else {
    newQuantity = quantity;
  }

  // Validate product stock
  const product = await Product.findById(cartItem.product);
  if (!product || !product.isActive) {
    return next(new ErrorResponse("Product not found or inactive", 404));
  }

  if (product.stock < newQuantity) {
    return next(
      new ErrorResponse(
        `Insufficient stock. Only ${product.stock} items available`,
        400
      )
    );
  }

  // Update or remove item
  if (newQuantity <= 0) {
    user.cart.items.splice(itemIndex, 1);
  } else {
    cartItem.quantity = newQuantity;
    cartItem.addedAt = Date.now();
  }

  user.cart.updatedAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Cart item quantity updated successfully",
    data: {
      itemId,
      quantity: newQuantity > 0 ? newQuantity : 0,
      removed: newQuantity <= 0,
    },
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const user = await User.findById(req.user.id);

  // Find item in cart
  const itemIndex = user.cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse("Item not found in cart", 404));
  }

  // Remove item from cart
  user.cart.items.splice(itemIndex, 1);
  user.cart.updatedAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: {
      itemId,
      itemCount: user.cart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.cart.items = [];
  user.cart.coupon = null;
  user.cart.updatedAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    data: {
      items: [],
      itemCount: 0,
    },
  });
});

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon/apply
// @access  Private
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { couponCode } = req.body;

  if (!couponCode) {
    return next(new ErrorResponse("Please provide coupon code", 400));
  }

  // Get user cart with populated products
  const user = await User.findById(req.user.id).populate({
    path: "cart.items.product",
    select: "name price category",
  });

  if (!user.cart.items || user.cart.items.length === 0) {
    return next(new ErrorResponse("Cart is empty", 400));
  }

  // Find coupon
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return next(new ErrorResponse("Invalid or expired coupon", 400));
  }

  // Check coupon validity
  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return next(new ErrorResponse("Coupon is not yet valid", 400));
  }

  if (coupon.validUntil && now > coupon.validUntil) {
    return next(new ErrorResponse("Coupon has expired", 400));
  }

  // Check usage limits
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return next(new ErrorResponse("Coupon usage limit reached", 400));
  }

  // Check per user usage limit
  if (coupon.perUserLimit) {
    const userUsageCount = await Order.countDocuments({
      user: req.user.id,
      "coupon.code": coupon.code,
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return next(
        new ErrorResponse(
          "You have reached your usage limit for this coupon",
          400
        )
      );
    }
  }

  // Calculate subtotal to check minimum purchase
  const subtotal = user.cart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
    return next(
      new ErrorResponse(
        `Minimum purchase amount of $${coupon.minPurchaseAmount} required for this coupon`,
        400
      )
    );
  }

  // Check if coupon applies to specific categories
  if (coupon.categories && coupon.categories.length > 0) {
    const hasValidCategory = user.cart.items.some((item) =>
      coupon.categories.includes(item.product.category?.toString())
    );

    if (!hasValidCategory) {
      return next(
        new ErrorResponse("Coupon does not apply to items in your cart", 400)
      );
    }
  }

  // Check if coupon applies to specific products
  if (coupon.products && coupon.products.length > 0) {
    const cartProductIds = user.cart.items.map((item) =>
      item.product._id.toString()
    );
    const hasValidProduct = cartProductIds.some((productId) =>
      coupon.products.includes(productId)
    );

    if (!hasValidProduct) {
      return next(
        new ErrorResponse("Coupon does not apply to items in your cart", 400)
      );
    }
  }

  // Apply coupon to cart
  user.cart.coupon = coupon._id;
  user.cart.updatedAt = Date.now();
  await user.save();

  // Calculate discount for response
  const discount = calculateDiscount(subtotal, coupon);

  res.status(200).json({
    success: true,
    message: "Coupon applied successfully",
    data: {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
      },
    },
  });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon/remove
// @access  Private
export const removeCoupon = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user.cart.coupon) {
    return next(new ErrorResponse("No coupon applied to cart", 400));
  }

  user.cart.coupon = null;
  user.cart.updatedAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Coupon removed successfully",
    data: {},
  });
});

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
export const getCartSummary = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "cart.items.product",
    select: "name price images stock",
  });

  // Filter out inactive products
  const validCartItems = user.cart.items.filter(
    (item) => item.product && item.product.isActive
  );

  // Calculate subtotal
  const subtotal = validCartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  // Calculate discount if coupon exists
  let discount = 0;
  if (user.cart.coupon) {
    const coupon = await Coupon.findById(user.cart.coupon);
    if (coupon && coupon.isActive) {
      discount = calculateDiscount(subtotal, coupon);
    }
  }

  // Calculate shipping
  const shippingCost = calculateShipping(validCartItems);

  // Calculate tax
  const taxableAmount = subtotal - discount + shippingCost;
  const tax = calculateTax(taxableAmount);

  // Calculate total
  const total = subtotal - discount + shippingCost + tax;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        subtotal,
        discount,
        shipping: shippingCost,
        tax,
        total,
        itemCount: validCartItems.reduce((sum, item) => sum + item.quantity, 0),
        productCount: validCartItems.length,
      },
      items: validCartItems.map((item) => ({
        itemId: item._id,
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]?.url || null,
        stock: item.product.stock,
        subtotal: item.product.price * item.quantity,
      })),
    },
  });
});

// @desc    Move cart item to wishlist
// @route   POST /api/cart/:itemId/move-to-wishlist
// @access  Private
export const moveToWishlist = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const user = await User.findById(req.user.id);

  // Find item in cart
  const itemIndex = user.cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse("Item not found in cart", 404));
  }

  const cartItem = user.cart.items[itemIndex];
  const productId = cartItem.product;

  // Check if product is already in wishlist
  if (user.wishlist.includes(productId)) {
    // Remove from cart only
    user.cart.items.splice(itemIndex, 1);
    user.cart.updatedAt = Date.now();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product already in wishlist. Removed from cart.",
      data: {
        movedToWishlist: false,
        removedFromCart: true,
      },
    });
  }

  // Add to wishlist
  user.wishlist.push(productId);

  // Remove from cart
  user.cart.items.splice(itemIndex, 1);
  user.cart.updatedAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Item moved to wishlist successfully",
    data: {
      movedToWishlist: true,
      removedFromCart: true,
      productId,
    },
  });
});

// @desc    Merge cart (useful for guest to logged-in user conversion)
// @route   POST /api/cart/merge
// @access  Private
export const mergeCart = asyncHandler(async (req, res, next) => {
  const { guestCart } = req.body; // Array of { productId, quantity }

  if (!guestCart || !Array.isArray(guestCart)) {
    return next(new ErrorResponse("Please provide guest cart items", 400));
  }

  const user = await User.findById(req.user.id);

  for (const guestItem of guestCart) {
    const { productId, quantity = 1 } = guestItem;

    // Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      continue; // Skip invalid products
    }

    // Check if product already in user's cart
    const existingItemIndex = user.cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity, checking stock
      const newQuantity =
        user.cart.items[existingItemIndex].quantity + quantity;
      if (product.stock >= newQuantity) {
        user.cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        user.cart.items[existingItemIndex].quantity = product.stock;
      }
    } else {
      // Add new item, checking stock
      const addQuantity = Math.min(quantity, product.stock);
      if (addQuantity > 0) {
        user.cart.items.push({
          product: productId,
          quantity: addQuantity,
          addedAt: Date.now(),
        });
      }
    }
  }

  user.cart.updatedAt = Date.now();
  await user.save();

  // Get updated cart count
  const itemCount = user.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  res.status(200).json({
    success: true,
    message: "Cart merged successfully",
    data: {
      itemsMerged: guestCart.length,
      newItemCount: itemCount,
    },
  });
});

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
export const getCartCount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const itemCount = user.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const productCount = user.cart.items.length;

  res.status(200).json({
    success: true,
    data: {
      itemCount,
      productCount,
    },
  });
});
