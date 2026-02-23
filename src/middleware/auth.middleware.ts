import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/token.js";

interface DecodedPayload {
  userId: string;
  iat: number;
}

// Extend Request interface locally for this file if needed,
// but it's better to declare it globally if used across the app.
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * @desc    Middleware to protect routes - Check if user is authenticated
 */
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Check if token exists in headers
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ApiError("Not authorized, please login again", 401));
    }

    // 2) Verify token (Check if not expired or manipulated)
    const decoded = verifyToken(token) as DecodedPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError("The user belonging to this token no longer exists", 401),
      );
    }

    // 4) Check if user is active
    if (currentUser.active === "inactive") {
      return next(new ApiError("Your account is deactivated", 401));
    }

    // 5) Grant access to protected route
    req.user = currentUser;
    next();
  },
);

/**
 * @desc    Middleware to restrict access to specific roles
 */
export const allowedTo = (...roles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.type)) {
      return next(
        new ApiError("You do not have permission to perform this action", 403),
      );
    }
    next();
  });
