import { Request, Response, RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";
import { ISubCategory } from "../models/subCategory.model.js";
import {
  createSubCategoryService,
  getAllSubCategoriesService,
  getSubCategoryByIdService,
  updateSubCategoryService,
  deleteSubCategoryService,
} from "../services/subCategory.service.js";
import { ApiError } from "../utils/apiError.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";
import { Types } from "mongoose";

/**
 * @desc    Create subCategory
 * @route   POST /api/subcategories
 * @access  Private/Admin
 */
export const createSubCategory: RequestHandler<
  {},
  IApiResponse<ISubCategory>,
  { name: string; category: Types.ObjectId }
> = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  const subCategory = await createSubCategoryService(name, category);
  sendSuccessResponse(
    res,
    "SubCategory created successfully",
    subCategory,
    201,
  );
});

/**
 * @desc    Get all subCategories
 * @route   GET /api/subcategories
 * @access  Public
 */
export const getAllSubCategories: RequestHandler<
  { categoryId?: Types.ObjectId },
  IPaginatedResponse<ISubCategory>,
  {},
  { page?: string; per_page?: string }
> = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1") || 1);
  const per_page = Math.max(1, parseInt(req.query.per_page || "5") || 5);

  let filter = {};
  if (req.params.categoryId) {
    filter = { category: req.params.categoryId };
  }

  const { subCategories, pagination } = await getAllSubCategoriesService(
    page,
    per_page,
    filter,
  );

  sendPaginatedResponse(
    res,
    "SubCategories fetched successfully",
    subCategories,
    pagination,
  );
});

/**
 * @desc    Get subCategory by ID
 * @route   GET /api/subcategories/:id
 * @access  Public
 */
export const getSubCategoryById: RequestHandler<
  { id: string },
  IApiResponse<ISubCategory>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await getSubCategoryByIdService(id);

  if (!subCategory) {
    next(new ApiError("SubCategory not found", 404));
  } else {
    sendSuccessResponse(res, "SubCategory fetched successfully", subCategory);
  }
});

/**
 * @desc    Update subCategory by ID
 * @route   PUT /api/subcategories/:id
 * @access  Private/Admin
 */
export const updateSubCategory: RequestHandler<
  { id: string },
  IApiResponse<ISubCategory>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;
  const subCategory = await updateSubCategoryService(id, name, category);

  if (!subCategory) {
    next(new ApiError("SubCategory not found", 404));
  } else {
    sendSuccessResponse(res, "SubCategory updated successfully", subCategory);
  }
});

export const deleteSubCategory: RequestHandler<
  { id: string },
  IApiResponse<ISubCategory>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await deleteSubCategoryService(id);

  if (!subCategory) {
    next(new ApiError("SubCategory not found", 404));
  } else {
    sendSuccessResponse(res, "SubCategory deleted successfully", subCategory);
  }
});
