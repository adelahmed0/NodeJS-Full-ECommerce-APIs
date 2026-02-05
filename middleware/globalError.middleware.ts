import { Request, Response, NextFunction } from "express";

const globalError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

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
