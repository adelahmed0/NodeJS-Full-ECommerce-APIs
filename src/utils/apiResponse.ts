import { Response } from "express";
import { IApiResponse, IPaginatedResponse } from "../types/api.types.js";

/**
 * Send a success response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  message: string,
  data: T,
  statusCode: number = 200,
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
  message: string,
  data: T[],
  pagination: IPaginatedResponse<T>["pagination"],
  statusCode: number = 200,
): Response<IPaginatedResponse<T>> => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
    pagination,
  });
};
