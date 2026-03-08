/**
 * Brand Controller
 * Handles all requests related to brand management including creation, listing, updates, and deletion.
 */
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
 * @desc    Create a new brand in the store catalog
 * @route   POST /api/brands
 * @access  Private/Admin
 */
export const createBrand = factory.createOne<
  IBrand,
  { name: string } & Partial<IBrand>
>(createBrandService, "Brand"); // Logic for initial brand creation

/**
 * @desc    Fetch a paginated list of all active brands
 * @route   GET /api/brands
 * @access  Public
 */
export const getAllBrands = factory.getAll<IBrand>(
  getAllBrandsService, // Handles standardized query features (sort, filter, etc.)
  "Brands",
);

/**
 * @desc    Fetch a individual brand document by its unique ID
 * @route   GET /api/brands/:id
 * @access  Public
 */
export const getBrandById = factory.getOne<IBrand>(
  getBrandByIdService, // Encapsulates Mongoose findById logic
  "Brand",
);

/**
 * @desc    Update a brand's information (name, logo, etc.)
 * @route   PUT /api/brands/:id
 * @access  Private/Admin
 */
export const updateBrand = factory.updateOne<IBrand, Partial<IBrand>>(
  updateBrandService, // Managed via factory for consistent error handling
  "Brand",
);

/**
 * @desc    Permanently delete a brand from the database
 * @route   DELETE /api/brands/:id
 * @access  Private/Admin
 */
export const deleteBrand = factory.deleteOne<IBrand>(
  deleteBrandService, // Atomic removal via service layer
  "Brand",
);
