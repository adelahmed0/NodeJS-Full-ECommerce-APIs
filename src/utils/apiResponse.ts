import { Response } from "express";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";

/**
 * Send a success response
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
 * Send a paginated success response
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
