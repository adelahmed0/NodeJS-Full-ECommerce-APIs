import express, { Router } from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategory.controller.js";

import {
  createSubCategoryValidator,
  getAllSubCategoriesValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} from "../validators/subCategory.validator.js";

const router: Router = express.Router();

router.post("/", createSubCategoryValidator, createSubCategory);
router.get("/", getAllSubCategoriesValidator, getAllSubCategories);
router.get("/:id", getSubCategoryValidator, getSubCategoryById);
router.put("/:id", updateSubCategoryValidator, updateSubCategory);
router.delete("/:id", deleteSubCategoryValidator, deleteSubCategory);

export default router;
