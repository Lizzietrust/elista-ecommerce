import { body, validationResult } from "express-validator";
import User from "../models/User.js";

// Check if email already exists in database
const checkEmailExists = async (email) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("Email is already registered");
  }
  return true;
};

// Check if email exists in database (for login/reset)
const checkEmailExistsForLogin = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("No account found with this email");
  }
  return true;
};

// Validate password strength
const validatePasswordStrength = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error(
      "Password must be at least 6 characters with uppercase, lowercase, and number",
    );
  }
  return true;
};

// Registration validation
export const validateRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .custom(checkEmailExists),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(validatePasswordStrength),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10,15}$/)
    .withMessage("Please provide a valid phone number (10-15 digits)"),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  // Address validation (optional fields)
  body("address.street").optional().trim(),
  body("address.city").optional().trim(),
  body("address.state").optional().trim(),
  body("address.zipCode").optional().trim(),
  body("address.country").optional().trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Login validation
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .custom(checkEmailExistsForLogin),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Forgot password validation
export const validateForgotPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Reset password validation
export const validateResetPassword = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(validatePasswordStrength),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Update password validation (for logged-in users)
export const validatePasswordUpdate = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("Current password is required")
    .isLength({ min: 6 })
    .withMessage("Current password must be at least 6 characters"),

  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .custom(validatePasswordStrength)
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),

  body("confirmNewPassword")
    .trim()
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New passwords do not match");
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Resend verification email validation
export const validateResendVerification = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// User update validation
export const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(/^\d{10,15}$/)
    .withMessage("Please provide a valid phone number (10-15 digits)"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Invalid gender specified"),

  // Address validation
  body("address.street")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),

  body("address.city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City is required"),

  body("address.state")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("State is required"),

  body("address.zipCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Zip code is required"),

  body("address.country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Country is required"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Product creation validation
export const validateProduct = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Product name must be between 3 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 10 })
    .withMessage("Product description must be at least 10 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("brand")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Brand cannot exceed 100 characters"),

  body("images").optional().isArray().withMessage("Images must be an array"),

  body("colors").optional().isArray().withMessage("Colors must be an array"),

  body("sizes").optional().isArray().withMessage("Sizes must be an array"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("weight.value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number"),

  body("weight.unit")
    .optional()
    .isIn(["g", "kg", "lb", "oz"])
    .withMessage("Invalid weight unit"),

  body("comparePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Compare price must be a positive number"),

  body("costPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cost price must be a positive number"),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Product update validation
export const validateProductUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Product name must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Product description must be at least 10 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("category").optional().isMongoId().withMessage("Invalid category ID"),

  body("brand")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Brand cannot exceed 100 characters"),

  body("images").optional().isArray().withMessage("Images must be an array"),

  body("colors").optional().isArray().withMessage("Colors must be an array"),

  body("sizes").optional().isArray().withMessage("Sizes must be an array"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("weight.value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Weight must be a positive number"),

  body("weight.unit")
    .optional()
    .isIn(["g", "kg", "lb", "oz"])
    .withMessage("Invalid weight unit"),

  body("comparePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Compare price must be a positive number"),

  body("costPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cost price must be a positive number"),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Category creation validation
export const validateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("parent")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  body("meta.title")
    .optional()
    .trim()
    .isLength({ max: 70 })
    .withMessage("Meta title cannot exceed 70 characters"),

  body("meta.description")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Meta description cannot exceed 160 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("image").optional().isURL().withMessage("Image must be a valid URL"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Category update validation
export const validateCategoryUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("parent")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  body("meta.title")
    .optional()
    .trim()
    .isLength({ max: 70 })
    .withMessage("Meta title cannot exceed 70 characters"),

  body("meta.description")
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage("Meta description cannot exceed 160 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("image").optional().isURL().withMessage("Image must be a valid URL"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Review validation - Enhanced version with more fields
export const validateReview = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Comment must be between 10 and 2000 characters"),

  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),

  body("images").optional().isArray().withMessage("Images must be an array"),

  body("images.*.url").optional().isURL().withMessage("Invalid image URL"),

  body("images.*.caption")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Caption cannot exceed 100 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Order validation
export const validateOrder = [
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required")
    .isObject()
    .withMessage("Shipping address must be an object"),

  body("shippingAddress.street")
    .notEmpty()
    .withMessage("Street address is required"),

  body("shippingAddress.city").notEmpty().withMessage("City is required"),

  body("shippingAddress.state").notEmpty().withMessage("State is required"),

  body("shippingAddress.zipCode")
    .notEmpty()
    .withMessage("Zip code is required"),

  body("shippingAddress.country").notEmpty().withMessage("Country is required"),

  body("items")
    .notEmpty()
    .withMessage("Order items are required")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),

  body("items.*.product")
    .notEmpty()
    .withMessage("Product ID is required for each item")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("items.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["stripe", "credit_card", "debit_card", "cod", "bank_transfer"])
    .withMessage("Invalid payment method"),

  body("shippingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Shipping price must be a positive number"),

  body("taxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Tax price must be a positive number"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// ================= CART VALIDATORS =================

// Cart item validation (for adding to cart)
export const validateCartItem = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("color")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Color cannot exceed 50 characters"),

  body("size")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Size cannot exceed 20 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Cart update validation (for updating cart item)
export const validateCartUpdate = [
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("productId").optional().isMongoId().withMessage("Invalid product ID"),

  body("operation")
    .optional()
    .isIn(["increment", "decrement", "set"])
    .withMessage("Operation must be 'increment', 'decrement', or 'set'"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Coupon validation (for applying coupon)
export const validateCoupon = [
  body("couponCode")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Coupon code must be between 3 and 20 characters")
    .matches(/^[A-Z0-9]+$/)
    .withMessage("Coupon code can only contain uppercase letters and numbers"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Merge cart validation (for guest to user cart merging)
export const validateMergeCart = [
  body("guestCart")
    .notEmpty()
    .withMessage("Guest cart is required")
    .isArray()
    .withMessage("Guest cart must be an array"),

  body("guestCart.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each item")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("guestCart.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Cart item quantity validation
export const validateCartQuantity = [
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("operation")
    .optional()
    .isIn(["increment", "decrement"])
    .withMessage("Operation must be 'increment' or 'decrement'"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// ================= END CART VALIDATORS =================

// Wishlist validation
export const validateWishlistItem = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Address validation (for adding/updating addresses)
export const validateAddress = [
  body("street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required")
    .isLength({ max: 200 })
    .withMessage("Street address cannot exceed 200 characters"),

  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters"),

  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ max: 100 })
    .withMessage("State cannot exceed 100 characters"),

  body("zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip code is required")
    .matches(/^\d{5,10}$/)
    .withMessage("Please provide a valid zip code (5-10 digits)"),

  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters"),

  body("addressType")
    .optional()
    .isIn(["home", "work", "other"])
    .withMessage("Address type must be 'home', 'work', or 'other'"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),

  body("phone")
    .optional()
    .matches(/^\d{10,15}$/)
    .withMessage("Please provide a valid phone number (10-15 digits)"),

  body("fullName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Full name cannot exceed 100 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Payment validation (Stripe only)
export const validatePayment = [
  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["credit_card", "debit_card", "stripe", "cod", "bank_transfer"])
    .withMessage("Invalid payment method"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("currency")
    .optional()
    .isIn(["USD", "EUR", "GBP", "CAD", "AUD"])
    .withMessage("Invalid currency"),

  body("cardNumber")
    .if(
      body("paymentMethod")
        .equals("credit_card")
        .or(body("paymentMethod").equals("debit_card")),
    )
    .notEmpty()
    .withMessage("Card number is required for card payments")
    .matches(/^\d{16}$/)
    .withMessage("Card number must be 16 digits"),

  body("cardExpiry")
    .if(
      body("paymentMethod")
        .equals("credit_card")
        .or(body("paymentMethod").equals("debit_card")),
    )
    .notEmpty()
    .withMessage("Card expiry is required")
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage("Card expiry must be in MM/YY format"),

  body("cardCVC")
    .if(
      body("paymentMethod")
        .equals("credit_card")
        .or(body("paymentMethod").equals("debit_card")),
    )
    .notEmpty()
    .withMessage("CVC is required")
    .matches(/^\d{3,4}$/)
    .withMessage("CVC must be 3 or 4 digits"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Stripe payment validation
export const validateStripePayment = [
  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID"),

  body("paymentMethodId")
    .optional()
    .isString()
    .withMessage("Payment method ID must be a string"),

  body("savePaymentMethod")
    .optional()
    .isBoolean()
    .withMessage("savePaymentMethod must be a boolean"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Stripe checkout session validation
export const validateStripeCheckoutSession = [
  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required")
    .isMongoId()
    .withMessage("Invalid order ID"),

  body("successUrl")
    .notEmpty()
    .withMessage("Success URL is required")
    .isURL()
    .withMessage("Success URL must be a valid URL"),

  body("cancelUrl")
    .notEmpty()
    .withMessage("Cancel URL is required")
    .isURL()
    .withMessage("Cancel URL must be a valid URL"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Coupon creation validation (for admin)
export const validateCouponCreation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Coupon code must be between 3 and 20 characters")
    .matches(/^[A-Z0-9]+$/)
    .withMessage("Coupon code can only contain uppercase letters and numbers"),

  body("discountType")
    .notEmpty()
    .withMessage("Discount type is required")
    .isIn(["percentage", "fixed", "free_shipping"])
    .withMessage(
      "Discount type must be 'percentage', 'fixed', or 'free_shipping'",
    ),

  body("discountValue")
    .isFloat({ min: 0 })
    .withMessage("Discount value must be a positive number"),

  body("maxDiscountAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Max discount amount must be a positive number"),

  body("minPurchaseAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum purchase amount must be a positive number"),

  body("validFrom")
    .optional()
    .isISO8601()
    .withMessage("Valid from must be a valid date"),

  body("validUntil")
    .optional()
    .isISO8601()
    .withMessage("Valid until must be a valid date"),

  body("usageLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Usage limit must be at least 1"),

  body("perUserLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Per user limit must be at least 1"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("categories")
    .optional()
    .isArray()
    .withMessage("Categories must be an array"),

  body("products")
    .optional()
    .isArray()
    .withMessage("Products must be an array"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Payment method validation
export const validatePaymentMethod = [
  body("paymentMethodId")
    .notEmpty()
    .withMessage("Payment method ID is required")
    .isString()
    .withMessage("Payment method ID must be a string"),

  body("type").optional().isIn(["card"]).withMessage("Type must be 'card'"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Refund validation (admin only)
export const validateRefund = [
  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Search validation
export const validateSearch = [
  body("query")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2 and 100 characters"),

  body("category").optional().isMongoId().withMessage("Invalid category ID"),

  body("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  body("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),

  body("sort")
    .optional()
    .isIn(["price_asc", "price_desc", "newest", "popular", "rating"])
    .withMessage("Invalid sort option"),

  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be at least 1"),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    next();
  },
];

// Common middleware to handle validation errors
export const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors for consistent response
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  };
};
