/**
 * System User Management Routes
 * Restricted to Administrators. Supports full CRUD operations,
 * including administrative password changes and avatar resizing.
 */
import express, { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
} from "../controllers/user.controller.js";
import {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateUserPasswordValidator,
} from "../validators/user.validator.js";
import {
  uploadSingleImage,
  resizeImage,
  parseFormData,
} from "../middleware/uploadImage.middleware.js";
import User, { UserRole } from "../models/user.model.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";

const router: Router = express.Router();

const userAvatarUpload = uploadSingleImage("avatar");
const resizeUserAvatar = resizeImage(User, "user", "users", "avatar", 600, 600);

router.use(protect, allowedTo(UserRole.ADMIN));

router
  .route("/")
  /**
   * @desc    Get all users list
   * @route   GET /api/users
   * @access  Private/Admin
   */
  .get(getAllUsers)
  /**
   * @desc    Create a new user manually
   * @route   POST /api/users
   * @access  Private/Admin
   */
  .post(userAvatarUpload, createUserValidator, resizeUserAvatar, createUser);

/**
 * @desc    Admin-forced password change for a user account
 * @route   PUT /api/users/change-password/:id
 * @access  Private/Admin
 */
router.put(
  "/change-password/:id",
  parseFormData(),
  updateUserPasswordValidator,
  updateUserPassword,
);

router
  .route("/:id")
  /**
   * @desc    Retrieve user details by MongoID
   * @route   GET /api/users/:id
   * @access  Private/Admin
   */
  .get(getUserValidator, getUserById)
  /**
   * @desc    Full update of user profile
   * @route   PUT /api/users/:id
   * @access  Private/Admin
   */
  .put(userAvatarUpload, updateUserValidator, resizeUserAvatar, updateUser)
  /**
   * @desc    Permanent removal of a user
   * @route   DELETE /api/users/:id
   * @access  Private/Admin
   */
  .delete(deleteUserValidator, deleteUser);

export default router;
