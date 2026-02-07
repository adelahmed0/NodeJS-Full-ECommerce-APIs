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

const router: Router = express.Router();

router.use("/:categoryId/sub-categories", subCategoryRouter);

router.post("/", createCategoryValidator, createCategory);
router.get("/", getAllCategoriesValidator, getAllCategories);
router.get("/:id", getCategoryByIdValidator, getCategoryById);
router.put("/:id", updateCategoryValidator, updateCategory);
router.delete("/:id", deleteCategoryValidator, deleteCategory);

export default router;
