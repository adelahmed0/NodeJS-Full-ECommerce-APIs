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
import * as factory from "./handlerFactory.controller.js";

export const setCategoryIdToBody = (req: any, res: any, next: any) => {
  if (!req.body.category && req.params.categoryId)
    req.body.category = req.params.categoryId;
  next();
};
/**
 * @desc    Create subCategory
 * @route   POST /api/subcategories
 * @access  Private/Admin
 */
export const createSubCategory: RequestHandler<
  { categoryId?: Types.ObjectId },
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
  { categoryId?: string },
  IPaginatedResponse<ISubCategory>,
  {},
  {
    page?: string;
    per_page?: string;
    search?: string;
    sort?: string;
    category?: string;
  }
> = asyncHandler(async (req, res) => {
  // Build query string with category filter if provided
  const queryString = { ...req.query };

  // If categoryId is in params (nested route), add it to query
  if (req.params.categoryId) {
    queryString.category = req.params.categoryId;
  }

  const { subCategories, pagination } =
    await getAllSubCategoriesService(queryString);

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

export const deleteSubCategory = factory.deleteOne<ISubCategory>(
  deleteSubCategoryService,
  "SubCategory",
);
