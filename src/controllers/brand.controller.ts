import { Request, Response, RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";
import { IBrand } from "../models/brand.model.js";
import {
  createBrandService,
  getAllBrandsService,
  getBrandByIdService,
  updateBrandService,
  deleteBrandService,
} from "../services/brand.service.js";
import { ApiError } from "../utils/apiError.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";

/**
 * @desc    Create brand
 * @route   POST /api/brands
 * @access  Private/Admin
 */
export const createBrand: RequestHandler<
  {},
  IApiResponse<IBrand>,
  { name: string }
> = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const brand = await createBrandService(name);
  sendSuccessResponse(res, "Brand created successfully", brand, 201);
});

/**
 * @desc    Get all brands
 * @route   GET /api/brands
 * @access  Public
 */
export const getAllBrands: RequestHandler<
  {},
  IPaginatedResponse<IBrand>,
  {},
  { page?: string; per_page?: string }
> = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1") || 1);
  const per_page = Math.max(1, parseInt(req.query.per_page || "5") || 5);

  const { brands, pagination } = await getAllBrandsService(page, per_page);

  sendPaginatedResponse(res, "Brands fetched successfully", brands, pagination);
});

/**
 * @desc    Get brand by ID
 * @route   GET /api/brands/:id
 * @access  Public
 */
export const getBrandById: RequestHandler<
  { id: string },
  IApiResponse<IBrand>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await getBrandByIdService(id);

  if (!brand) {
    next(new ApiError("Brand not found", 404));
  } else {
    sendSuccessResponse(res, "Brand fetched successfully", brand);
  }
});

/**
 * @desc    Update brand by ID
 * @route   PUT /api/brands/:id
 * @access  Private/Admin
 */
export const updateBrand: RequestHandler<
  { id: string },
  IApiResponse<IBrand>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const brand = await updateBrandService(id, name);

  if (!brand) {
    next(new ApiError("Brand not found", 404));
  } else {
    sendSuccessResponse(res, "Brand updated successfully", brand);
  }
});

/**
 * @desc    Delete brand by ID
 * @route   DELETE /api/brands/:id
 * @access  Private/Admin
 */
export const deleteBrand: RequestHandler<
  { id: string },
  IApiResponse<IBrand>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await deleteBrandService(id);

  if (!brand) {
    next(new ApiError("Brand not found", 404));
  } else {
    sendSuccessResponse(res, "Brand deleted successfully", brand);
  }
});
