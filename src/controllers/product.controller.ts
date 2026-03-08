/**
 * Product Controller
 * Orchestrates the lifecycle of product catalog items, handling search, filters, and inventory updates.
 */
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
import * as factory from "./handlersFactory.controller.js";

/**
 * @desc    Add a new product to the catalog
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = factory.createOne<IProduct, Partial<IProduct>>(
  createProductService, // Logic for persistence and relationship handling
  "Product",
);

/**
 * @desc    Retrieve a list of products with pagination, search, and filtering
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = factory.getAll<IProduct>(
  getAllProductsService, // Logic for processing query parameters via ApiFeatures
  "Products",
);

/**
 * @desc    Fetch detailed information for a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = factory.getOne<IProduct>(
  getProductByIdService, // Includes deep population of categories and brands
  "Product",
);

/**
 * @desc    Update an existing product's details
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = factory.updateOne<IProduct, Partial<IProduct>>(
  updateProductService, // Handles partial updates and re-population
  "Product",
);

/**
 * @desc    Permanently remove a product from the database
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = factory.deleteOne<IProduct>(
  deleteProductService, // Triggers atomic deletion
  "Product",
);
