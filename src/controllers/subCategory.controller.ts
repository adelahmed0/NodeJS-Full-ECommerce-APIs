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
  res.status(201).json({
    status: true,
    message: "SubCategory created successfully",
    data: subCategory,
  });
});

/**
 * @desc    Get all subCategories
 * @route   GET /api/subcategories
 * @access  Public
 */
export const getAllSubCategories: RequestHandler<
  {},
  IPaginatedResponse<ISubCategory>,
  {},
  { page?: string; per_page?: string }
> = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1") || 1);
  const per_page = Math.max(1, parseInt(req.query.per_page || "5") || 5);

  const { subCategories, pagination } = await getAllSubCategoriesService(
    page,
    per_page,
  );

  res.status(200).json({
    status: true,
    message: "SubCategories fetched successfully",
    data: subCategories,
    pagination,
  });
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
    res.status(200).json({
      status: true,
      message: "SubCategory fetched successfully",
      data: subCategory,
    });
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
  const { name } = req.body;
  const subCategory = await updateSubCategoryService(id, name);

  if (!subCategory) {
    next(new ApiError("SubCategory not found", 404));
  } else {
    res.status(200).json({
      status: true,
      message: "SubCategory updated successfully",
      data: subCategory,
    });
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
    res.status(200).json({
      status: true,
      message: "SubCategory deleted successfully",
      data: subCategory,
    });
  }
});
