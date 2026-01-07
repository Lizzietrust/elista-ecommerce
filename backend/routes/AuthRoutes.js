import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/AuthController.js";
import { protect } from "../middleware/auth.js";
import { body } from "express-validator";

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.put(
  "/reset-password/:resettoken",
  resetPasswordValidation,
  resetPassword
);
router.get("/verify-email/:token", verifyEmail);
router.post(
  "/resend-verification",
  forgotPasswordValidation,
  resendVerificationEmail
);

// Protected routes - all routes below this will use the protect middleware
router.use(protect);
router.get("/me", getMe);
router.put("/updatedetails", updateDetails);
router.put("/updatepassword", updatePassword);

export default router;
