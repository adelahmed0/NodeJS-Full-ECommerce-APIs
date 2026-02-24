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

router.use("/:categoryId/sub-categories", subCategoryRouter);

router.post(
  "/",
  protect,
  allowedTo(UserRole.ADMIN),
  uploadSingleImage("image"),
  createCategoryValidator,
  resizeImage<ICategory>(Category, "category", "categories", "image", 600, 600),
  createCategory,
);

router.get("/", getAllCategoriesValidator, getAllCategories);
router.get("/:id", getCategoryByIdValidator, getCategoryById);

router.put(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  uploadSingleImage("image"),
  updateCategoryValidator,
  resizeImage<ICategory>(Category, "category", "categories", "image", 600, 600),
  updateCategory,
);
router.delete(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  deleteCategoryValidator,
  deleteImage(Category, "categories"),
  deleteCategory,
);

export default router;
