import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

/**
 * Global Error Handling Middleware
 * Catch-all for any error passed into next(err)
 */
const globalError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Set default status code and status if not provided
  err.statusCode = err.statusCode || 500;
  err.status = err.status || false;

  // Specific handling for JWT related errors
  if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
  if (err.name === "TokenExpiredError") err = handleJwtExpired();

  // Differentiate error responses based on environment
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

/**
 * Handle invalid JWT signatures
 */
const handleJwtInvalidSignature = () =>
  new ApiError("Invalid session. Please log in again.", 401);

/**
 * Handle expired JWT tokens
 */
const handleJwtExpired = () =>
  new ApiError("Your session has expired. Please log in again.", 401);

/**
 * Development Error Response: Detailed with stack trace and full error object
 */
const sendErrorForDev = (err: any, res: Response) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });

/**
 * Production Error Response: Simplified for security and user experience
 */
const sendErrorForProd = (err: any, res: Response) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

export default globalError;
