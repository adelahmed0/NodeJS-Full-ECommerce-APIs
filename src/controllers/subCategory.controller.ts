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
import * as factory from "./handlersFactory.controller.js";

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
export const createSubCategory = factory.createOne<
  ISubCategory,
  { name: string; category: Types.ObjectId } & Partial<ISubCategory>
>(createSubCategoryService, "SubCategory");

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
export const updateSubCategory = factory.updateOne<
  ISubCategory,
  Partial<ISubCategory>
>(updateSubCategoryService, "SubCategory");

export const deleteSubCategory = factory.deleteOne<ISubCategory>(
  deleteSubCategoryService,
  "SubCategory",
);
