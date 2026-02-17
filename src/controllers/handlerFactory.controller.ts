import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse } from "../types/api.types.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

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

    sendSuccessResponse(res, `${modelName} deleted successfully`, document);
  });
};
