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
import * as factory from "./handlersFactory.controller.js";

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = factory.createOne<
  ICategory,
  { name: string } & Partial<ICategory>
>(createCategoryService, "Category");

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getAllCategories: RequestHandler<
  {},
  IPaginatedResponse<ICategory>,
  {},
  { page?: string; per_page?: string; search?: string; sort?: string }
> = asyncHandler(async (req, res) => {
  const { categories, pagination } = await getAllCategoriesService(req.query);

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
export const updateCategory = factory.updateOne<ICategory, Partial<ICategory>>(
  updateCategoryService,
  "Category",
);

export const deleteCategory = factory.deleteOne<ICategory>(
  deleteCategoryService,
  "Category",
);
