import { Request, Response, RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";
import { ICategory } from "../models/category.model.js";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService
} from "../services/category.service.js";

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory: RequestHandler<
  {},
  IApiResponse<ICategory>,
  { name: string }
> = asyncHandler(async (req : Request, res : Response) => {
  const { name } = req.body;
  const category = await createCategoryService(name);
  res.status(201).json({
    status: true,
    message: "Category created successfully",
    data: category,
  });
});

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getAllCategories: RequestHandler<
  {},
  IPaginatedResponse<ICategory>,
  {},
  { page?: string; per_page?: string }
> = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1") || 1);
  const per_page = Math.max(1, parseInt(req.query.per_page || "5") || 5);

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
export const getCategoryById: RequestHandler<
  { id: string },
  IApiResponse<ICategory>
> = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const category = await getCategoryByIdService(id);

  if (!category) {
    res.status(404).json({ status: false, message: "Category not found" });
    return;
  }

  res.status(200).json({
    status: true,
    message: "Category fetched successfully",
    data: category,
  });
});

/**
 * @desc    Update category by ID
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory: RequestHandler<
  { id: string },
  IApiResponse<ICategory>
> = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const category = await updateCategoryService(id, name);

  if (!category) {
    res.status(404).json({ status: false, message: "Category not found" });
    return;
  }

  res.status(200).json({
    status: true,
    message: "Category updated successfully",
    data: category,
  });
});
