import express, { Router } from "express";
import { rateLimit } from "express-rate-limit";
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
 * Authentication Rate Limiter: Prevent automated brute-force attacks on login and password reset.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 5, // Maximum 5 attempts per IP per 15 minutes
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many attempts, please try again after 15 minutes.",
  },
});

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/signup
 * @access  Public
 */
router.post("/signup", authLimiter, parseFormData(), signupValidator, signup);

/**
 * @desc    Login and receive a JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post("/login", authLimiter, parseFormData(), loginValidator, login);
/**
 * @desc    Initiate password recovery by sending a reset code to email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
router.post(
  "/forgot-password",
  authLimiter,
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
  authLimiter,
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
  authLimiter,
  parseFormData(),
  resetPasswordValidator,
  resetPassword,
);

export default router;
