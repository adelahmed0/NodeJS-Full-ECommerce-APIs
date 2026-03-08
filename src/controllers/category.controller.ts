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
export const getAllCategories = factory.getAll<ICategory>(
  getAllCategoriesService,
  "Categories",
);

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = factory.getOne<ICategory>(
  getCategoryByIdService,
  "Category",
);

/**
 * @desc    Update category by ID
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = factory.updateOne<ICategory, Partial<ICategory>>(
  updateCategoryService,
  "Category",
);

/**
 * @desc    Delete category by ID
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = factory.deleteOne<ICategory>(
  deleteCategoryService,
  "Category",
);
