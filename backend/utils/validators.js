import { body, validationResult } from "express-validator";

// User update validation
export const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

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
