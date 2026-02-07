import { Request, Response, RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";
import { ICategory } from "../models/category.model.js";
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/category.service.js";
import { ApiError } from "../utils/apiError.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory: RequestHandler<
  {},
  IApiResponse<ICategory>,
  { name: string }
> = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const category = await createCategoryService(name);
  sendSuccessResponse(res, "Category created successfully", category, 201);
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

  sendPaginatedResponse(
    res,
    "Categories fetched successfully",
    categories,
    pagination,
  );
});

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById: RequestHandler<
  { id: string },
  IApiResponse<ICategory>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await getCategoryByIdService(id);

  if (!category) {
    next(new ApiError("Category not found", 404));
  } else {
    sendSuccessResponse(res, "Category fetched successfully", category);
  }
});

/**
 * @desc    Update category by ID
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory: RequestHandler<
  { id: string },
  IApiResponse<ICategory>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await updateCategoryService(id, name);

  if (!category) {
    next(new ApiError("Category not found", 404));
  } else {
    sendSuccessResponse(res, "Category updated successfully", category);
  }
});

export const deleteCategory: RequestHandler<
  { id: string },
  IApiResponse<ICategory>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await deleteCategoryService(id);

  if (!category) {
    next(new ApiError("Category not found", 404));
  } else {
    sendSuccessResponse(res, "Category deleted successfully", category);
  }
});
