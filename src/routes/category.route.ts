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
} from "../validators/category.validator.js";

const router: Router = express.Router();

router.post("/", createCategoryValidator, createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryByIdValidator, getCategoryById);
router.put("/:id", updateCategoryValidator, updateCategory);
router.delete("/:id", deleteCategoryValidator, deleteCategory);

export default router;
