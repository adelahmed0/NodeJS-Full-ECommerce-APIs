import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

const globalError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || false;

  if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
  if (err.name === "TokenExpiredError") err = handleJwtExpired();

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

const handleJwtInvalidSignature = () =>
  new ApiError("Invalid session. Please log in again.", 401);

const handleJwtExpired = () =>
  new ApiError("Your session has expired. Please log in again.", 401);

const sendErrorForDev = (err: any, res: Response) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });

const sendErrorForProd = (err: any, res: Response) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

export default globalError;
