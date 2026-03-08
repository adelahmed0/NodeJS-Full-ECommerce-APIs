/**
 * Category Routes
 * Public access for catalog browsing; Restricted Admin-only access for data modifications.
 * Includes nested routing for sub-categories.
 */
import express, { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  getCategoryByIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  getAllCategoriesValidator,
} from "../validators/category.validator.js";
import subCategoryRouter from "./subCategory.route.js";
import {
  uploadSingleImage,
  resizeImage,
  deleteImage,
} from "../middleware/uploadImage.middleware.js";
import Category, { ICategory } from "../models/category.model.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { UserRole } from "../models/user.model.js";

const router: Router = express.Router();

/**
 * @desc    Nested routing for sub-categories under a specific category
 */
router.use("/:categoryId/sub-categories", subCategoryRouter);

/**
 * @desc    Create a new product category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
router.post(
  "/",
  protect,
  allowedTo(UserRole.ADMIN),
  uploadSingleImage("image"),
  createCategoryValidator,
  resizeImage<ICategory>(Category, "category", "categories", "image", 600, 600),
  createCategory,
);

/**
 * @desc    Fetch all categories with pagination/search
 * @route   GET /api/categories
 * @access  Public
 */
router.get("/", getAllCategoriesValidator, getAllCategories);

/**
 * @desc    Get a single category by its ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
router.get("/:id", getCategoryByIdValidator, getCategoryById);

/**
 * @desc    Update an existing category's details
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
router.put(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  uploadSingleImage("image"),
  updateCategoryValidator,
  resizeImage<ICategory>(Category, "category", "categories", "image", 600, 600),
  updateCategory,
);

/**
 * @desc    Permanently delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  deleteCategoryValidator,
  deleteImage(Category, "categories"),
  deleteCategory,
);

export default router;
