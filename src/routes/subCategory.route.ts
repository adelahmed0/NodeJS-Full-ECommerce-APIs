import express, { Router } from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
} from "../controllers/subCategory.controller.js";

import {
  createSubCategoryValidator,
  getSubCategoryValidator,
} from "../validators/subCategory.validator.js";

const router: Router = express.Router();

router.post("/", createSubCategoryValidator, createSubCategory);
router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryValidator, getSubCategoryById);

export default router;
