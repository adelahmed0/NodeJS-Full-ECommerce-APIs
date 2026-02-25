import express, { Router } from "express";
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
  changePasswordValidator,
} from "../validators/auth.validator.js";
import {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { parseFormData } from "../middleware/uploadImage.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router: Router = express.Router();

router.post("/signup", parseFormData(), signupValidator, signup);
router.post("/login", parseFormData(), loginValidator, login);
router.post(
  "/forgot-password",
  parseFormData(),
  forgotPasswordValidator,
  forgotPassword,
);
router.post(
  "/verify-reset-code",
  parseFormData(),
  verifyResetCodeValidator,
  verifyResetCode,
);
router.put(
  "/reset-password",
  parseFormData(),
  resetPasswordValidator,
  resetPassword,
);

/**
 * @desc    Get User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
router.get("/profile", protect, getProfile);

/**
 * @desc    Change User Password (for authenticated users)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
router.put(
  "/change-password",
  parseFormData(),
  protect,
  changePasswordValidator,
  changePassword,
);

export default router;
