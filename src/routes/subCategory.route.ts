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

router.post(
  "/",
  protect,
  allowedTo(UserRole.ADMIN),
  parseFormData(),
  setCategoryIdToBody,
  createSubCategoryValidator,
  createSubCategory,
);
router.get("/", getAllSubCategoriesValidator, getAllSubCategories);
router.get("/:id", getSubCategoryValidator, getSubCategoryById);
router.put(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  parseFormData(),
  updateSubCategoryValidator,
  updateSubCategory,
);
router.delete(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  deleteSubCategoryValidator,
  deleteSubCategory,
);

export default router;
