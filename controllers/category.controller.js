import asyncHandler from "express-async-handler";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
} from "../services/category.service.js";

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await createCategoryService(name);
  res.status(201).json({ status: true, message: "Category created successfully", data: category });
});

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const per_page = Math.max(1, parseInt(req.query.per_page) || 5);

  const { categories, pagination } = await getAllCategoriesService(
    page,
    per_page,
  );

  res.status(200).json({
    status: true,
    message: "Categories fetched successfully",
    data: categories,
    pagination,
  });
});

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await getCategoryByIdService(id);
  if (!category) {
    res.status(404).json({ status: false, message: "Category not found" });
  }
  res.status(200).json({ status: true, message: "Category fetched successfully", data: category });
});

