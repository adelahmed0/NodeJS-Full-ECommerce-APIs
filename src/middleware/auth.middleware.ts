import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import User, { IUser } from "../models/user.model.js";
import { IProduct } from "../models/product.model.js";
import { ICoupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/apiError.js";
import { verifyToken } from "../utils/token.js";

/**
 * Expected JWT Payload structure
 */
interface DecodedPayload {
  userId: string;
  iat: number;
}

/**
 * Extending Express Request interface to include custom properties
 */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      product?: IProduct;
      coupon?: ICoupon;
      filterObj?: any;
    }
  }
}

/**
 * @desc    Middleware to protect routes - Authenticates the user via JWT
 * 1) Checks Authorization header for Bearer token
 * 2) Verifies the token
 * 3) Checks if user still exists and is active
 * 4) Checks if password was changed after token issuance
 */
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Extract token from Authorization header
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

    // 2) Verify token integrity and expiration
    const decoded = verifyToken(token) as DecodedPayload;

    // 3) Verify the user associated with the token exists in DB
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError("The user belonging to this token no longer exists", 401),
      );
    }

    // 4) Ensure account is active
    if (currentUser.status !== "active") {
      return next(
        new ApiError(
          "Your account is not active. Please activate your account",
          403,
        ),
      );
    }

    // 5) Security check: If password was changed after JWT was issued, invalidate token
    if (currentUser.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        currentUser.passwordChangedAt.getTime() / 1000,
      );
      if (changedTimestamp > decoded.iat) {
        return next(
          new ApiError(
            "User recently changed password. please login again",
            401,
          ),
        );
      }
    }

    // 6) Store user in request object for use in subsequent controllers
    req.user = currentUser;
    next();
  },
);

/**
 * @desc    Authorization Middleware - Limits access based on user roles (e.g., admin, user)
 * @param   roles  List of allowed roles
 */
export const allowedTo = (...roles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Ensure user is already authenticated by 'protect' middleware
    if (!req.user) {
      return next(new ApiError("Not authorized, please login again", 401));
    }

    // Check if user's role is in the allowed list
    const hasRole = roles.includes(req.user.type);

    if (!hasRole) {
      return next(
        new ApiError("You do not have permission to perform this action", 403),
      );
    }

    next();
  });
