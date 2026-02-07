import { Request, Response, RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";
import { ISubCategory } from "../models/subCategory.model.js";
import {
  createSubCategoryService,
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
  { name: string, category: Types.ObjectId }
> = asyncHandler(async (req: Request, res: Response) => {
  const { name, category } = req.body;
  const subCategory = await createSubCategoryService(name, category);
  res.status(201).json({
    status: true,
    message: "SubCategory created successfully",
    data: subCategory,
  });
});
