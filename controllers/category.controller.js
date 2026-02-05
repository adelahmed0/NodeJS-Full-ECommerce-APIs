import asyncHandler from "express-async-handler";
import { createCategoryService,getAllCategoriesService } from "../services/category.service.js";

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

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await getAllCategoriesService();
  res.status(200).json({ data: categories,results:categories.length });
});
