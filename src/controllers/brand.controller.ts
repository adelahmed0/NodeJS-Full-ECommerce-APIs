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
import * as factory from "./handlersFactory.controller.js";

/**
 * @desc    Create brand
 * @route   POST /api/brands
 * @access  Private/Admin
 */
export const createBrand = factory.createOne<
  IBrand,
  { name: string } & Partial<IBrand>
>(createBrandService, "Brand");

/**
 * @desc    Get all brands
 * @route   GET /api/brands
 * @access  Public
 */
export const getAllBrands = factory.getAll<IBrand>(
  getAllBrandsService,
  "Brands",
);

/**
 * @desc    Get brand by ID
 * @route   GET /api/brands/:id
 * @access  Public
 */
export const getBrandById = factory.getOne<IBrand>(
  getBrandByIdService,
  "Brand",
);

/**
 * @desc    Update brand by ID
 * @route   PUT /api/brands/:id
 * @access  Private/Admin
 */
export const updateBrand = factory.updateOne<IBrand, Partial<IBrand>>(
  updateBrandService,
  "Brand",
);

/**
 * @desc    Delete brand by ID - Using Factory
 * @route   DELETE /api/brands/:id
 * @access  Private/Admin
 */
export const deleteBrand = factory.deleteOne<IBrand>(
  deleteBrandService,
  "Brand",
);
