import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse } from "../types/api.types.js";
import { ApiError } from "../utils/apiError.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";

/**
 * Handlers Factory: A collection of generic controller functions
 * intended to automate standard CRUD operations and reduce boilerplate.
 */

/**
 * Factory function to create a new document
 * @param serviceFunction - The logic to create the entity
 * @param modelName - Human-readable name for logging and responses
 */
export const createOne = <T, B = any>(
  serviceFunction: (body: B) => Promise<T>,
  modelName: string,
): RequestHandler<{}, IApiResponse<T>, B> => {
  return asyncHandler(async (req, res) => {
    // Execute creation via service
    const document = await serviceFunction(req.body);

    // Return standard success response
    sendSuccessResponse(res, {
      message: `${modelName} created successfully`,
      data: document,
      statusCode: 201, // HTTP 201 Created
    });
  });
};

/**
 * Factory function to delete a document by ID
 * @param serviceFunction - The logic to delete the entity
 * @param modelName - Human-readable name for error/success messages
 */
export const deleteOne = <T>(
  serviceFunction: (id: string) => Promise<T | null>,
  modelName: string,
): RequestHandler<{ id: string }, IApiResponse<T>> => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await serviceFunction(id);

    // Guard: Return 404 if document doesn't exist
    if (!document) {
      return next(new ApiError(`${modelName} not found`, 404));
    }

    sendSuccessResponse(res, {
      message: `${modelName} deleted successfully`,
      data: document,
    });
  });
};

/**
 * Factory function to update a document by ID
 * @param serviceFunction - The logic to update the entity
 * @param modelName - Human-readable name
 */
export const updateOne = <T, B = any>(
  serviceFunction: (id: string, body: B) => Promise<T | null>,
  modelName: string,
): RequestHandler<{ id: string }, IApiResponse<T>, B> => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await serviceFunction(id, req.body);

    if (!document) {
      return next(new ApiError(`${modelName} not found`, 404));
    }

    sendSuccessResponse(res, {
      message: `${modelName} updated successfully`,
      data: document,
    });
  });
};

/**
 * Factory function to get a single document by its ID
 * @param serviceFunction - The logic to fetch the entity
 * @param modelName - Human-readable name
 */
export const getOne = <T>(
  serviceFunction: (id: string, filterObj?: any) => Promise<T | null>,
  modelName: string,
): RequestHandler<{ id: string }, IApiResponse<T>> => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Support for optional filtering (e.g., checking if review belongs to user)
    const document = await serviceFunction(id, req.filterObj);

    if (!document) {
      return next(new ApiError(`${modelName} not found`, 404));
    }

    sendSuccessResponse(res, {
      message: `${modelName} fetched successfully`,
      data: document,
    });
  });
};

/**
 * Factory function to get a paginated list of documents
 * @param serviceFunction - The logic to fetch multiple entities with features
 * @param modelName - Human-readable name
 */
export const getAll = <T>(
  serviceFunction: (
    queryString: any,
    filterObj?: any,
  ) => Promise<{ documents: T[]; pagination: any }>,
  modelName: string,
): RequestHandler<any, any, any> => {
  return asyncHandler(async (req, res) => {
    // Handle nested routing filters (e.g., /categories/:categoryId/subcategories)
    let filterObj: any = req.filterObj || {};
    if (req.params.categoryId)
      filterObj = { ...filterObj, category: req.params.categoryId };
    else if (req.params.productId)
      filterObj = { ...filterObj, product: req.params.productId };

    // Fetch documents and pagination metadata from service
    const { documents, pagination } = await serviceFunction(
      req.query,
      filterObj,
    );

    // Return standard paginated response
    sendPaginatedResponse(res, {
      message: `${modelName} fetched successfully`,
      data: documents,
      pagination,
    });
  });
};
