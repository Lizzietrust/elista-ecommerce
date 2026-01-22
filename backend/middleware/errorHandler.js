/**
 * Custom Error Class for handling operational errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom Error Response Class
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Error handler middleware
 * This should be the LAST middleware in the chain
 */
export const errorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Something went wrong!";

  // Log error for development
  if (process.env.NODE_ENV === "development") {
    console.error("🔥 ERROR DETAILS:");
    console.error(`🔴 Status: ${err.status}`);
    console.error(`🔴 Status Code: ${err.statusCode}`);
    console.error(`🔴 Message: ${err.message}`);
    console.error(`🔴 Stack: ${err.stack}`);
    console.error(`🔴 Path: ${req.originalUrl}`);
    console.error(`🔴 Method: ${req.method}`);
    console.error(`🔴 IP: ${req.ip}`);
    console.error(`🔴 User Agent: ${req.get("User-Agent")}`);
    console.error(`🔴 Timestamp: ${new Date().toISOString()}`);

    if (err.errors) {
      console.error(`🔴 Validation Errors:`, err.errors);
    }
  }

  // Log error for production (structured logging)
  if (process.env.NODE_ENV === "production") {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        status: err.status,
        statusCode: err.statusCode,
        message: err.message,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        stack: err.isOperational ? undefined : err.stack, // Only log stack for non-operational errors
      }),
    );
  }

  // Handle different types of errors
  let error = { ...err };
  error.message = err.message;

  // Handle specific error types

  // 1. Mongoose CastError (Invalid ObjectId)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    error = handleCastError(err);
    return sendErrorResponse(error, req, res);
  }

  // 2. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = handleDuplicateKeyError(err);
    error = new AppError(message, 400);
    return sendErrorResponse(error, req, res);
  }

  // 3. Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = handleValidationError(err);
    error = new AppError(message, 400);
    return sendErrorResponse(error, req, res);
  }

  // 4. JSON Web Token Error
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = new AppError(message, 401);
    return sendErrorResponse(error, req, res);
  }

  // 5. JWT Token Expired Error
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again.";
    error = new AppError(message, 401);
    return sendErrorResponse(error, req, res);
  }

  // 6. Multer File Upload Errors
  if (err.name === "MulterError") {
    const message = handleMulterError(err);
    error = new AppError(message, 400);
    return sendErrorResponse(error, req, res);
  }

  // 7. Cloudinary Errors
  if (err.name === "CloudinaryError" || err.http_code) {
    const message = handleCloudinaryError(err);
    error = new AppError(message, 400);
    return sendErrorResponse(error, req, res);
  }

  // 8. Stripe Errors
  if (err.type === "StripeError" || err.raw?.type === "StripeError") {
    const message = handleStripeError(err);
    error = new AppError(message, 400);
    return sendErrorResponse(error, req, res);
  }

  // 9. Rate Limit Error
  if (err.name === "RateLimitError") {
    const message = "Too many requests from this IP. Please try again later.";
    error = new AppError(message, 429);
    return sendErrorResponse(error, req, res);
  }

  // 10. Syntax Error (Invalid JSON)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    const message = "Invalid JSON payload. Please check your request body.";
    error = new AppError(message, 400);
    return sendErrorResponse(error, req, res);
  }

  // Send generic error response for unhandled errors
  return sendErrorResponse(error, req, res);
};

/**
 * Send formatted error response
 */
const sendErrorResponse = (error, req, res) => {
  // Determine if we should send detailed error in production
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV === "development";
  const isApiClient =
    req.get("Content-Type") === "application/json" ||
    req.path.startsWith("/api");

  // Base error response
  const errorResponse = {
    success: false,
    status: error.status || "error",
    statusCode: error.statusCode || 500,
    message: error.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add stack trace in development mode
  if (isDevelopment && error.stack) {
    errorResponse.stack = error.stack;
  }

  // Add validation errors if they exist
  if (error.errors) {
    errorResponse.errors = error.errors;
  }

  // Add error code if provided
  if (error.code) {
    errorResponse.code = error.code;
  }

  // For API clients, send JSON response
  if (isApiClient) {
    return res.status(error.statusCode).json(errorResponse);
  }

  // For web browsers, render error page (if you have views)
  // If you don't have views, send JSON anyway
  return res.status(error.statusCode).json(errorResponse);
};

/**
 * Handle Mongoose CastError
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key error
 */
const handleDuplicateKeyError = (err) => {
  // Extract field name from error message
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  // Check if it's an email
  if (field === "email") {
    return `User with email "${value}" already exists. Please use a different email.`;
  }

  // Check if it's a slug
  if (field === "slug") {
    return `A resource with this identifier already exists.`;
  }

  // Generic message
  return `Duplicate field value: "${value}". Please use another value.`;
};

/**
 * Handle Mongoose validation error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => {
    // Handle different types of validation errors
    if (el.name === "CastError") {
      return `Invalid value for ${el.path}.`;
    }

    if (el.kind === "required") {
      return `${el.path} is required.`;
    }

    if (el.kind === "minlength") {
      return `${el.path} must be at least ${el.properties.minlength} characters.`;
    }

    if (el.kind === "maxlength") {
      return `${el.path} must be at most ${el.properties.maxlength} characters.`;
    }

    if (el.kind === "min") {
      return `${el.path} must be at least ${el.properties.min}.`;
    }

    if (el.kind === "max") {
      return `${el.path} must be at most ${el.properties.max}.`;
    }

    if (el.kind === "enum") {
      return `${el.path} must be one of: ${el.properties.enumValues.join(", ")}.`;
    }

    if (el.kind === "unique") {
      return `${el.path} must be unique.`;
    }

    // Default error message
    return el.message;
  });

  return `Validation failed: ${errors.join(" ")}`;
};

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (err) => {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return `File is too large. Maximum size is ${process.env.MAX_FILE_SIZE || "5MB"}.`;

    case "LIMIT_FILE_COUNT":
      return "Too many files uploaded.";

    case "LIMIT_UNEXPECTED_FILE":
      return "Unexpected file field.";

    case "LIMIT_PART_COUNT":
      return "Too many parts in the request.";

    case "LIMIT_FIELD_KEY":
      return "Field name is too long.";

    case "LIMIT_FIELD_VALUE":
      return "Field value is too long.";

    case "LIMIT_FIELD_COUNT":
      return "Too many fields in the request.";

    default:
      return "File upload error. Please try again.";
  }
};

/**
 * Handle Cloudinary errors
 */
const handleCloudinaryError = (err) => {
  // Cloudinary specific error codes
  const cloudinaryErrors = {
    400: "Bad request to Cloudinary. Please check the file format.",
    401: "Cloudinary authentication failed.",
    403: "Cloudinary access denied.",
    404: "Resource not found on Cloudinary.",
    420: "Rate limited by Cloudinary. Please try again later.",
    500: "Cloudinary server error. Please try again.",
  };

  if (cloudinaryErrors[err.http_code]) {
    return cloudinaryErrors[err.http_code];
  }

  return "Image upload failed. Please try again.";
};

/**
 * Handle Stripe errors
 */
const handleStripeError = (err) => {
  // Common Stripe error messages
  const stripeErrors = {
    card_declined: "Your card was declined. Please try a different card.",
    expired_card: "Your card has expired. Please use a different card.",
    incorrect_cvc: "The CVC number is incorrect.",
    incorrect_number: "The card number is incorrect.",
    invalid_number: "The card number is invalid.",
    invalid_expiry_month: "The expiration month is invalid.",
    invalid_expiry_year: "The expiration year is invalid.",
    invalid_cvc: "The CVC number is invalid.",
    missing: "Payment information is missing.",
    processing_error: "An error occurred while processing your card.",
    rate_limit: "Too many requests. Please try again later.",
    authentication_required: "Payment requires authentication.",
  };

  const errorCode = err.code || err.raw?.code;

  if (stripeErrors[errorCode]) {
    return stripeErrors[errorCode];
  }

  return "Payment processing failed. Please try again.";
};

/**
 * Async handler to catch async errors
 * Wrap async route handlers with this
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler
 * Use this as the last route in your app
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error types for consistent error handling
 */
export const ErrorTypes = {
  // Authentication errors (4xx)
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",

  // Business logic errors
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  ORDER_LIMIT_EXCEEDED: "ORDER_LIMIT_EXCEEDED",
};

/**
 * Create standardized error responses
 */
export const createError = (type, message, details = null) => {
  const errorCodes = {
    [ErrorTypes.UNAUTHORIZED]: 401,
    [ErrorTypes.FORBIDDEN]: 403,
    [ErrorTypes.NOT_FOUND]: 404,
    [ErrorTypes.VALIDATION_ERROR]: 400,
    [ErrorTypes.CONFLICT]: 409,
    [ErrorTypes.INTERNAL_SERVER_ERROR]: 500,
    [ErrorTypes.SERVICE_UNAVAILABLE]: 503,
    [ErrorTypes.INSUFFICIENT_STOCK]: 400,
    [ErrorTypes.PAYMENT_FAILED]: 400,
    [ErrorTypes.ORDER_LIMIT_EXCEEDED]: 400,
  };

  const error = new AppError(message, errorCodes[type] || 500);
  error.type = type;

  if (details) {
    error.details = details;
  }

  return error;
};

/**
 * Rate limiter error handler
 */
export const rateLimitErrorHandler = (req, res) => {
  const error = createError(
    "RATE_LIMIT_EXCEEDED",
    "Too many requests from this IP. Please try again later.",
    {
      retryAfter: req.rateLimit?.retryAfter,
      limit: req.rateLimit?.limit,
      remaining: req.rateLimit?.remaining,
    },
  );

  res.setHeader("Retry-After", Math.ceil(req.rateLimit?.retryAfter || 60));
  res.status(429).json({
    success: false,
    status: "error",
    statusCode: 429,
    message: error.message,
    retryAfter: req.rateLimit?.retryAfter,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Database connection error handler
 */
export const handleDatabaseError = (err) => {
  console.error("Database connection error:", err);

  // Different handling based on error type
  if (err.name === "MongoNetworkError") {
    return new AppError(
      "Database connection failed. Please try again later.",
      503,
    );
  }

  if (err.name === "MongoTimeoutError") {
    return new AppError("Database request timed out. Please try again.", 504);
  }

  if (err.name === "MongoServerSelectionError") {
    return new AppError(
      "Unable to connect to database. Please try again later.",
      503,
    );
  }

  return new AppError("Database error occurred.", 500);
};

/**
 * Export error classes and utilities
 */
export { AppError, ErrorResponse };

/**
 * Example usage in controllers:
 *
 * import { asyncHandler, createError, ErrorTypes } from '../middleware/errorHandler.js';
 *
 * export const getUser = asyncHandler(async (req, res, next) => {
 *   const user = await User.findById(req.params.id);
 *
 *   if (!user) {
 *     return next(createError(ErrorTypes.NOT_FOUND, 'User not found'));
 *   }
 *
 *   if (user.id !== req.user.id && req.user.role !== 'admin') {
 *     return next(createError(ErrorTypes.FORBIDDEN, 'Not authorized'));
 *   }
 *
 *   res.status(200).json({ success: true, data: user });
 * });
 */
