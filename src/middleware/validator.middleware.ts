import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Global Validator Middleware
 * Checks for validation errors in the request object (populated by express-validator rules)
 * If errors exist, returns a 400 response with formatted error details.
 */
const validatorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Extract validation results
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Transform errors array into a clean object: { field: "message" }
    const formattedErrors = errors.array().reduce((acc: any, error: any) => {
      // Use 'path' for the field name and 'msg' for the error message
      acc[error.path] = error.msg;
      return acc;
    }, {});

    // Return structured error response
    return res.status(400).json({
      status: false,
      message: "Validation Error",
      errors: formattedErrors,
    });
  }

  // No errors, proceed to next middleware/controller
  next();
};

export default validatorMiddleware;
