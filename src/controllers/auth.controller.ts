import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  signupService,
  loginService,
  forgotPasswordService,
} from "../services/auth.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

/**
 * @desc    Signup
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await signupService(req.body);

  // Return user and token
  sendSuccessResponse(res, {
    message: "User signed up successfully",
    data: { user, token },
    statusCode: 201,
  });
});

/**
 * @desc    Login
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await loginService(req.body);

  // Return user and token
  sendSuccessResponse(res, {
    message: "User logged in successfully",
    data: { user, token },
  });
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await forgotPasswordService(req.body);
    sendSuccessResponse(res, {
      message: "Code sent successfully",
      statusCode: 200,
    });
  },
);
