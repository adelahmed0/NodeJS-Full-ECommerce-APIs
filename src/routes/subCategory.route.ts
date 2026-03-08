/**
 * Sub-Category Routes
 * Second-level product classifications. Utilizes mergeParams for
 * category-dependent filtering. Restricted to Admins for modifications.
 */
import express, { Router } from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
} from "../controllers/subCategory.controller.js";

import {
  createSubCategoryValidator,
  getAllSubCategoriesValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} from "../validators/subCategory.validator.js";
import { parseFormData } from "../middleware/uploadImage.middleware.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { UserRole } from "../models/user.model.js";

// mergeParams: true allows us to access the params of the parent router
const router: Router = express.Router({ mergeParams: true });

/**
 * @desc    Create a new sub-category
 * @route   POST /api/sub-categories (or /api/categories/:categoryId/sub-categories)
 * @access  Private/Admin
 */
router.post(
  "/",
  protect,
  allowedTo(UserRole.ADMIN),
  parseFormData(),
  setCategoryIdToBody,
  createSubCategoryValidator,
  createSubCategory,
);

/**
 * @desc    Fetch all sub-categories (optionally by categoryId)
 * @route   GET /api/sub-categories
 * @access  Public
 */
router.get("/", getAllSubCategoriesValidator, getAllSubCategories);

/**
 * @desc    Get a single sub-category by ID
 * @route   GET /api/sub-categories/:id
 * @access  Public
 */
router.get("/:id", getSubCategoryValidator, getSubCategoryById);

/**
 * @desc    Update an existing sub-category
 * @route   PUT /api/sub-categories/:id
 * @access  Private/Admin
 */
router.put(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  parseFormData(),
  updateSubCategoryValidator,
  updateSubCategory,
);

/**
 * @desc    Permanently delete a sub-category
 * @route   DELETE /api/sub-categories/:id
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  deleteSubCategoryValidator,
  deleteSubCategory,
);

export default router;
