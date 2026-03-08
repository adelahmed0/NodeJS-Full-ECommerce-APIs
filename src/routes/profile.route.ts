/**
 * User Profile Routes
 * Self-service portal for authenticated users to manage
 * their personal info, passwords, and account status.
 */
import express, { Router } from "express";
import {
  getProfile,
  changePassword,
  updateProfile,
  updateStatus,
} from "../controllers/profile.controller.js";
import {
  changePasswordValidator,
  updateProfileValidator,
  updateStatusValidator,
} from "../validators/profile.validator.js";
import { parseFormData } from "../middleware/uploadImage.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router: Router = express.Router();

// All routes in this file require authentication
router.use(protect);

/**
 * @desc    Fetch the authenticated user's profile data
 * @route   GET /api/profile
 * @access  Private
 */
router.get("/", getProfile);

/**
 * @desc    Allow user to change their own password
 * @route   PUT /api/profile/change-password
 * @access  Private
 */
router.put(
  "/change-password",
  parseFormData(),
  changePasswordValidator,
  changePassword,
);

/**
 * @desc    Update authenticated user's personal details
 * @route   PUT /api/profile/update
 * @access  Private
 */
router.put("/update", parseFormData(), updateProfileValidator, updateProfile);

/**
 * @desc    Update user account status (Self-service)
 * @route   PUT /api/profile/status
 * @access  Private
 */
router.put("/status", parseFormData(), updateStatusValidator, updateStatus);

export default router;
