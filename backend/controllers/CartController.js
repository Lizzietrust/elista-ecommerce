import mongoose from "mongoose";
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

const generateCartItemId = () => new mongoose.Types.ObjectId().toString();

export const getCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: "cart.items.product",
      select: "name price images slug stock isActive description",
      populate: {
        path: "category",
        select: "name slug",
      },
    })
    .select("cart");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  const validCartItems = user.cart.items.filter(
    (item) => item.product !== null && item.product !== undefined,
  );

  const formattedItems = validCartItems.map((item) => {
    const itemObj = item.toObject ? item.toObject() : item;

    if (!itemObj._id) {
      itemObj._id = generateCartItemId();
    }

    return {
      ...itemObj,
      id: itemObj._id.toString(),
      _id: itemObj._id.toString(),
    };
  });

  if (formattedItems.some((item, index) => !validCartItems[index]._id)) {
    user.cart.items = formattedItems.map((item) => ({
      ...item,
      _id: new mongoose.Types.ObjectId(item._id),
    }));
    await user.save();
  }

  const subtotal = formattedItems.reduce((total, item) => {
    const price = item.product?.price || item.priceAtAdd || 0;
    return total + price * item.quantity;
  }, 0);

  let discount = 0;
  let total = subtotal;

  if (user.cart.coupon) {
    const coupon = await Coupon.findById(user.cart.coupon);
    if (coupon && coupon.isActive) {
      discount = calculateDiscount(subtotal, coupon);
      total = subtotal - discount;
    }
  }

  const shippingCost = calculateShipping(formattedItems);
  total += shippingCost;

  const tax = calculateTax(total);
  total += tax;

  res.status(200).json({
    success: true,
    data: {
      items: formattedItems,
      summary: {
        subtotal,
        discount,
        shipping: shippingCost,
        tax,
        total,
        itemCount: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
        coupon: user.cart.coupon || null,
        productCount: formattedItems.length,
      },
    },
  });
});

export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, color, size } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  if (!product.isActive) {
    return next(new ErrorResponse("Product is not available", 400));
  }

  if (product.stock < quantity) {
    return next(
      new ErrorResponse(
        `Insufficient stock. Only ${product.stock} items available`,
        400,
      ),
    );
  }

  const user = await User.findById(req.user.id);

  const existingItemIndex = user.cart.items.findIndex((item) => {
    const match = item.product.toString() === productId;
    if (color) {
      return match && item.color === color;
    }
    if (size) {
      return match && item.size === size;
    }
    return match;
  });

  let itemId;
  if (existingItemIndex >= 0) {
    const newQuantity = user.cart.items[existingItemIndex].quantity + quantity;

    if (product.stock < newQuantity) {
      return next(
        new ErrorResponse(
          `Insufficient stock for updated quantity. Only ${product.stock} items available`,
          400,
        ),
      );
    }

    user.cart.items[existingItemIndex].quantity = newQuantity;
    user.cart.items[existingItemIndex].addedAt = Date.now();
    user.cart.items[existingItemIndex].priceAtAdd = product.price;

    if (!user.cart.items[existingItemIndex]._id) {
      user.cart.items[existingItemIndex]._id = new mongoose.Types.ObjectId();
    }
    itemId = user.cart.items[existingItemIndex]._id;
  } else {
    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      product: productId,
      quantity,
      addedAt: Date.now(),
      priceAtAdd: product.price,
    };

    if (color) newItem.color = color;
    if (size) newItem.size = size;

    user.cart.items.push(newItem);
    itemId = newItem._id;
  }

  user.cart.updatedAt = Date.now();
  await user.save();

  await user.populate({
    path: "cart.items.product",
    select: "name price images slug stock isActive description",
  });

  const validItems = user.cart.items.filter((item) => item.product !== null);

  res.status(200).json({
    success: true,
    message: "Item added to cart successfully",
    data: {
      items: validItems,
      itemCount: validItems.reduce((sum, item) => sum + item.quantity, 0),
      addedItemId: itemId,
    },
  });
});

export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity, productId } = req.body;

  const user = await User.findById(req.user.id);

  const itemIndex = user.cart.items.findIndex(
    (item) => item._id?.toString() === itemId,
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse("Item not found in cart", 404));
  }

  if (
    productId &&
    productId !== user.cart.items[itemIndex].product.toString()
  ) {
    const newProduct = await Product.findById(productId);
    if (!newProduct || !newProduct.isActive) {
      return next(new ErrorResponse("New product not found or inactive", 404));
    }

    if (newProduct.stock < quantity) {
      return next(
        new ErrorResponse(
          `Insufficient stock for new product. Only ${newProduct.stock} items available`,
          400,
        ),
      );
    }

    user.cart.items[itemIndex].product = productId;
  } else {
    if (quantity !== undefined) {
      const currentProduct = await Product.findById(
        user.cart.items[itemIndex].product,
      );

      if (!currentProduct || !currentProduct.isActive) {
        return next(new ErrorResponse("Product not found or inactive", 404));
      }

      if (currentProduct.stock < quantity) {
        return next(
          new ErrorResponse(
            `Insufficient stock. Only ${currentProduct.stock} items available`,
            400,
          ),
        );
      }
    }
  }

  if (quantity !== undefined) {
    if (quantity <= 0) {
      user.cart.items.splice(itemIndex, 1);
    } else {
      user.cart.items[itemIndex].quantity = quantity;
    }
  }

  user.cart.updatedAt = Date.now();
  await user.save();

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

export const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity, operation } = req.body;

  if (
    quantity === undefined &&
    operation !== "increment" &&
    operation !== "decrement"
  ) {
    return next(
      new ErrorResponse(
        "Please provide quantity or specify operation (increment/decrement)",
        400,
      ),
    );
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  const itemIndex = user.cart.items.findIndex(
    (item) => item._id?.toString() === itemId.toString(),
  );

  if (itemIndex === -1) {
    const productItemIndex = user.cart.items.findIndex(
      (item) => item.product?.toString() === itemId.toString(),
    );

    if (productItemIndex !== -1) {
      if (!user.cart.items[productItemIndex]._id) {
        user.cart.items[productItemIndex]._id = new mongoose.Types.ObjectId();
        await user.save();
      }

      return updateItemQuantity(
        user,
        productItemIndex,
        quantity,
        operation,
        res,
        next,
      );
    }

    return next(new ErrorResponse("Item not found in cart", 404));
  }

  if (!user.cart.items[itemIndex]._id) {
    user.cart.items[itemIndex]._id = new mongoose.Types.ObjectId();
    await user.save();
  }

  return updateItemQuantity(user, itemIndex, quantity, operation, res, next);
});

async function updateItemQuantity(
  user,
  itemIndex,
  quantity,
  operation,
  res,
  next,
) {
  const cartItem = user.cart.items[itemIndex];
  let newQuantity = cartItem.quantity;

  if (operation === "increment") {
    newQuantity += 1;
  } else if (operation === "decrement") {
    newQuantity -= 1;
  } else if (quantity !== undefined) {
    newQuantity = quantity;
  }

  if (newQuantity <= 0) {
    user.cart.items.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: {
        itemId: cartItem._id,
        quantity: 0,
        removed: true,
      },
    });
  }

  const product = await Product.findById(cartItem.product);
  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  if (!product.isActive) {
    return next(new ErrorResponse("Product is not available", 400));
  }

  if (product.stock < newQuantity) {
    return next(
      new ErrorResponse(
        `Insufficient stock. Only ${product.stock} items available`,
        400,
      ),
    );
  }

  cartItem.quantity = newQuantity;
  cartItem.addedAt = Date.now();
  user.cart.updatedAt = Date.now();

  await user.save();

  res.status(200).json({
    success: true,
    message: "Cart item quantity updated successfully",
    data: {
      itemId: cartItem._id,
      quantity: newQuantity,
      removed: false,
    },
  });
}

export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  const itemIndex = user.cart.items.findIndex(
    (item) => item._id?.toString() === itemId.toString(),
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse("Item not found in cart", 404));
  }

  user.cart.items.splice(itemIndex, 1);
  user.cart.updatedAt = Date.now();
  await user.save();

  const itemCount = user.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  res.status(200).json({
    success: true,
    message: "Item removed from cart successfully",
    data: {
      itemId,
      itemCount,
    },
  });
});

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

export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { couponCode } = req.body;

  if (!couponCode) {
    return next(new ErrorResponse("Please provide coupon code", 400));
  }

  const user = await User.findById(req.user.id).populate({
    path: "cart.items.product",
    select: "name price category",
  });

  if (!user.cart.items || user.cart.items.length === 0) {
    return next(new ErrorResponse("Cart is empty", 400));
  }

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return next(new ErrorResponse("Invalid or expired coupon", 400));
  }

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return next(new ErrorResponse("Coupon is not yet valid", 400));
  }

  if (coupon.validUntil && now > coupon.validUntil) {
    return next(new ErrorResponse("Coupon has expired", 400));
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return next(new ErrorResponse("Coupon usage limit reached", 400));
  }

  if (coupon.perUserLimit) {
    const userUsageCount = await Order.countDocuments({
      user: req.user.id,
      "coupon.code": coupon.code,
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return next(
        new ErrorResponse(
          "You have reached your usage limit for this coupon",
          400,
        ),
      );
    }
  }

  const subtotal = user.cart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
    return next(
      new ErrorResponse(
        `Minimum purchase amount of $${coupon.minPurchaseAmount} required for this coupon`,
        400,
      ),
    );
  }

  if (coupon.categories && coupon.categories.length > 0) {
    const hasValidCategory = user.cart.items.some((item) =>
      coupon.categories.includes(item.product.category?.toString()),
    );

    if (!hasValidCategory) {
      return next(
        new ErrorResponse("Coupon does not apply to items in your cart", 400),
      );
    }
  }

  if (coupon.products && coupon.products.length > 0) {
    const cartProductIds = user.cart.items.map((item) =>
      item.product._id.toString(),
    );
    const hasValidProduct = cartProductIds.some((productId) =>
      coupon.products.includes(productId),
    );

    if (!hasValidProduct) {
      return next(
        new ErrorResponse("Coupon does not apply to items in your cart", 400),
      );
    }
  }

  user.cart.coupon = coupon._id;
  user.cart.updatedAt = Date.now();
  await user.save();

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

export const getCartSummary = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "cart.items.product",
    select: "name price images stock",
  });

  const validCartItems = user.cart.items.filter(
    (item) => item.product && item.product.isActive,
  );

  const subtotal = validCartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  let discount = 0;
  if (user.cart.coupon) {
    const coupon = await Coupon.findById(user.cart.coupon);
    if (coupon && coupon.isActive) {
      discount = calculateDiscount(subtotal, coupon);
    }
  }

  const shippingCost = calculateShipping(validCartItems);

  const taxableAmount = subtotal - discount + shippingCost;
  const tax = calculateTax(taxableAmount);

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

export const moveToWishlist = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  const user = await User.findById(req.user.id);

  const itemIndex = user.cart.items.findIndex(
    (item) => item._id?.toString() === itemId,
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse("Item not found in cart", 404));
  }

  const cartItem = user.cart.items[itemIndex];
  const productId = cartItem.product;

  if (user.wishlist.includes(productId)) {
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

  user.wishlist.push(productId);

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

export const mergeCart = asyncHandler(async (req, res, next) => {
  const { guestCart } = req.body;

  if (!guestCart || !Array.isArray(guestCart)) {
    return next(new ErrorResponse("Please provide guest cart items", 400));
  }

  const user = await User.findById(req.user.id);

  for (const guestItem of guestCart) {
    const { productId, quantity = 1 } = guestItem;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      continue;
    }

    const existingItemIndex = user.cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (existingItemIndex >= 0) {
      const newQuantity =
        user.cart.items[existingItemIndex].quantity + quantity;
      if (product.stock >= newQuantity) {
        user.cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        user.cart.items[existingItemIndex].quantity = product.stock;
      }
    } else {
      const addQuantity = Math.min(quantity, product.stock);
      if (addQuantity > 0) {
        user.cart.items.push({
          _id: new mongoose.Types.ObjectId(),
          product: productId,
          quantity: addQuantity,
          addedAt: Date.now(),
          priceAtAdd: product.price,
        });
      }
    }
  }

  user.cart.updatedAt = Date.now();
  await user.save();

  const itemCount = user.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
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

export const getCartCount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const itemCount = user.cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
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
