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

const router: Router = express.Router();

router.use("/:categoryId/sub-categories", subCategoryRouter);

router.post(
  "/",
  uploadSingleImage("image"),
  createCategoryValidator,
  resizeImage<ICategory>(Category, "category", "categories", "image", 600, 600),
  createCategory,
);

router.get("/", getAllCategoriesValidator, getAllCategories);
router.get("/:id", getCategoryByIdValidator, getCategoryById);

router.put(
  "/:id",
  uploadSingleImage("image"),
  updateCategoryValidator,
  resizeImage<ICategory>(Category, "category", "categories", "image", 600, 600),
  updateCategory,
);
router.delete(
  "/:id",
  deleteCategoryValidator,
  deleteImage(Category, "categories"),
  deleteCategory,
);

export default router;
