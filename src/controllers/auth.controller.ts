import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { signupService, loginService } from "../services/auth.service.js";
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

/**
 * @desc    Login
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await loginService(req.body);

  // Return user and token
  sendSuccessResponse(res, "User logged in successfully", { user, token }, 200);
});
