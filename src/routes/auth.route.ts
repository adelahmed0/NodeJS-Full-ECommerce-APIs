/**
 * Authentication Routes
 * Public entry points for user Signup, Login, and secure Password Recovery.
 */
import express, { Router } from "express";
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";
import {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/auth.controller.js";
import { parseFormData } from "../middleware/uploadImage.middleware.js";

const router: Router = express.Router();

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/signup
 * @access  Public
 */
router.post("/signup", parseFormData(), signupValidator, signup);

/**
 * @desc    Login and receive a JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post("/login", parseFormData(), loginValidator, login);
/**
 * @desc    Initiate password recovery by sending a reset code to email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
router.post(
  "/forgot-password",
  parseFormData(),
  forgotPasswordValidator,
  forgotPassword,
);
/**
 * @desc    Verify the 6-digit code sent via email
 * @route   POST /api/auth/verify-reset-code
 * @access  Public
 */
router.post(
  "/verify-reset-code",
  parseFormData(),
  verifyResetCodeValidator,
  verifyResetCode,
);
/**
 * @desc    Update password after successful reset code verification
 * @route   PUT /api/auth/reset-password
 * @access  Public
 */
router.put(
  "/reset-password",
  parseFormData(),
  resetPasswordValidator,
  resetPassword,
);

export default router;
