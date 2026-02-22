import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { signupService } from "../services/auth.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

/**
 * @desc    Signup
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await signupService(req.body);

  // Return user and token
  sendSuccessResponse(res, "User signed up successfully", { user, token }, 201);
});
