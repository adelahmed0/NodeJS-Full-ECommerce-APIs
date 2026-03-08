import { Response } from "express";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";

/**
 * Standard utility to send successful JSON responses
 * @param res Express response object
 * @param message Human-readable status message
 * @param data Optional response body
 * @param statusCode HTTP success code (default 200)
 */
export const sendSuccessResponse = <T>(
  res: Response,
  {
    message,
    data = null,
    statusCode = 200,
  }: {
    message: string;
    data?: T | null;
    statusCode?: number;
  },
): Response<IApiResponse<T>> => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
};

/**
 * Utility to send paginated results with metadata
 * @param res Express response object
 * @param message Human-readable status message
 * @param data Array of result documents
 * @param pagination Metadata containing counts and current page
 * @param statusCode HTTP success code (default 200)
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  {
    message,
    data,
    pagination,
    statusCode = 200,
  }: {
    message: string;
    data: T[];
    pagination: IPaginatedResponse<T>["pagination"];
    statusCode?: number;
  },
): Response<IPaginatedResponse<T>> => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
    pagination,
  });
};
