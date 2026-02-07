import express, { Router } from "express";
import {
  createSubCategory,
} from "../controllers/subCategory.controller.js";
import { createSubCategoryValidator } from "../validators/subCategory.validator.js";

const router: Router = express.Router();

router.post("/", createSubCategoryValidator, createSubCategory);

export default router;
