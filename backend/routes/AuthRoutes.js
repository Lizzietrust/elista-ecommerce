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

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resettoken", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Protected routes
router.use(protect);
router.get("/me", getMe);
router.put("/updatedetails", updateDetails);
router.put("/updatepassword", updatePassword);

export default router;
