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

// mergeParams: true allows us to access the params of the parent router
const router: Router = express.Router({ mergeParams: true });

router.post(
  "/",
  parseFormData(),
  setCategoryIdToBody,
  createSubCategoryValidator,
  createSubCategory,
);
router.get("/", getAllSubCategoriesValidator, getAllSubCategories);
router.get("/:id", getSubCategoryValidator, getSubCategoryById);
router.put(
  "/:id",
  parseFormData(),
  updateSubCategoryValidator,
  updateSubCategory,
);
router.delete("/:id", deleteSubCategoryValidator, deleteSubCategory);

export default router;
