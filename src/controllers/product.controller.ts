import { Request, Response, RequestHandler } from "express";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";
import asyncHandler from "express-async-handler";
import Product, { IProduct } from "../models/product.model.js";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/product.service.js";
import { ApiError } from "../utils/apiError.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct: RequestHandler<
  {},
  IApiResponse<IProduct>,
  Partial<IProduct>
> = asyncHandler(async (req, res) => {
  const product = await createProductService(req.body);
  sendSuccessResponse(res, "Product created successfully", product, 201);
});

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts: RequestHandler<
  {},
  IPaginatedResponse<IProduct>,
  {},
  { page?: string; per_page?: string; sort?: string; [key: string]: any }
> = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1")) || 1);
  const per_page = Math.max(
    1,
    parseInt(String(req.query.per_page || "10")) || 10,
  );

  const filter = req.query;

  const { products, pagination } = await getAllProductsService(
    page,
    per_page,
    filter,
  );

  sendPaginatedResponse(
    res,
    "Products fetched successfully",
    products,
    pagination,
  );
});

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById: RequestHandler<
  { id: string },
  IApiResponse<IProduct>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await getProductByIdService(id);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  sendSuccessResponse(res, "Product fetched successfully", product);
});

/**
 * @desc    Update product by ID
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct: RequestHandler<
  { id: string },
  IApiResponse<IProduct>,
  Partial<IProduct>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Check if product exists
  const product = await Product.findById(id);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  const updatedProduct = await updateProductService(id, req.body);
  sendSuccessResponse(res, "Product updated successfully", updatedProduct);
});

/**
 * @desc    Delete product by ID
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct: RequestHandler<
  { id: string },
  IApiResponse<IProduct>
> = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await deleteProductService(id);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  sendSuccessResponse(res, "Product deleted successfully", product);
});
