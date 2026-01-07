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
import {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validatePasswordUpdate,
} from "../middleware/validators.js";

const router = express.Router();

// Public routes with external validators
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/logout", logout);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.put("/reset-password/:resettoken", validateResetPassword, resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post(
  "/resend-verification",
  validateForgotPassword, // Using same validator as forgot password for email validation
  resendVerificationEmail
);

// Protected routes - all routes below this will use the protect middleware
router.use(protect);
router.get("/me", getMe);
router.put("/updatedetails", updateDetails);
router.put("/updatepassword", validatePasswordUpdate, updatePassword);

export default router;
