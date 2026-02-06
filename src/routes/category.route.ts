import express, { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { getCategoryByIdValidator } from "../validators/category.validator.js";


const router: Router = express.Router();

router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryByIdValidator, getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
