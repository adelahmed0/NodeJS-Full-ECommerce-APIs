import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse } from "../types/api.types.js";
import { ApiError } from "../utils/apiError.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";

/**
 * Factory function to create a new document
 * @param serviceFunction - Service function that creates a document
 * @param modelName - Name of the model (for response message)
 */
export const createOne = <T, B = any>(
  serviceFunction: (body: B) => Promise<T>,
  modelName: string,
): RequestHandler<{}, IApiResponse<T>, B> => {
  return asyncHandler(async (req, res) => {
    const document = await serviceFunction(req.body);
    sendSuccessResponse(res, {
      message: `${modelName} created successfully`,
      data: document,
      statusCode: 201,
    });
  });
};

/**
 * Factory function to delete a document by ID
 * @param serviceFunction - Service function that deletes a document
 * @param modelName - Name of the model (for response message)
 */
export const deleteOne = <T>(
  serviceFunction: (id: string) => Promise<T | null>,
  modelName: string,
): RequestHandler<{ id: string }, IApiResponse<T>> => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await serviceFunction(id);

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
 * @param serviceFunction - Service function that updates a document
 * @param modelName - Name of the model (for response message)
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
 * Factory function to get a document by ID
 * @param serviceFunction - Service function that fetches a document
 * @param modelName - Name of the model (for response message)
 */
export const getOne = <T>(
  serviceFunction: (id: string) => Promise<T | null>,
  modelName: string,
): RequestHandler<{ id: string }, IApiResponse<T>> => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await serviceFunction(id);

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
 * Factory function to get all documents
 * @param serviceFunction - Service function that fetches all documents
 * @param modelName - Name of the model (for response message)
 */
export const getAll = <T>(
  serviceFunction: (
    queryString: any,
    filterObj?: any,
  ) => Promise<{ documents: T[]; pagination: any }>,
  modelName: string,
): RequestHandler<any, any, any> => {
  return asyncHandler(async (req, res) => {
    // Nested router filter
    let filterObj: any = req.filterObj || {};
    if (req.params.categoryId)
      filterObj = { ...filterObj, category: req.params.categoryId };
    else if (req.params.productId)
      filterObj = { ...filterObj, product: req.params.productId };

    const { documents, pagination } = await serviceFunction(
      req.query,
      filterObj,
    );
    sendPaginatedResponse(res, {
      message: `${modelName}s fetched successfully`,
      data: documents,
      pagination,
    });
  });
};
