import asyncHandler from "express-async-handler";
import { createCategoryService } from "../services/category.service.js";

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await createCategoryService(name);
  res.status(201).json({ data: category });
});
