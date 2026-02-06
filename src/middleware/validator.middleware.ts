import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

const validatorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Transform errors array into a clean object: { field: "message" }
    const formattedErrors = errors.array().reduce((acc: any, error: any) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});

    return res.status(400).json({
      status: false,
      message: "Validation Error",
      errors: formattedErrors,
    });
  }
  next();
};

export default validatorMiddleware;
