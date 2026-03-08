import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  signupService,
  loginService,
  forgotPasswordService,
  verifyResetCodeService,
  resetPasswordService,
} from "../services/auth.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

/**
 * @desc    Handle user registration (Signup)
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  // Delegate business logic (validation check, user creation, token generation) to service
  const { user, token } = await signupService(req.body);

  // Return the newly created user and their JWT token
  sendSuccessResponse(res, {
    message: "User signed up successfully",
    data: { user, token },
    statusCode: 201, // HTTP 201 Created
  });
});

/**
 * @desc    Handle user authentication (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Service handles credentials verification and token issuance
  const { user, token } = await loginService(req.body);

  // Return user info and token on success
  sendSuccessResponse(res, {
    message: "User logged in successfully",
    data: { user, token },
  });
});

/**
 * @desc    Initiate password recovery by sending a reset code to email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    // Generate code and send email via service
    await forgotPasswordService(req.body);

    sendSuccessResponse(res, {
      message: "Code sent successfully to your email",
      statusCode: 200,
    });
  },
);

/**
 * @desc    Internal verification of the recovery code sent via email
 * @route   POST /api/auth/verify-reset-code
 * @access  Public
 */
export const verifyResetCode = asyncHandler(
  async (req: Request, res: Response) => {
    // Check if code exists and is still valid
    await verifyResetCodeService(req.body.resetCode);

    sendSuccessResponse(res, {
      message: "Reset code verified successfully",
      statusCode: 200,
    });
  },
);

/**
 * @desc    Set a new password after successful code verification
 * @route   PUT /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    // Update password and return new credentials
    const { user, token } = await resetPasswordService(
      req.body.email,
      req.body.newPassword,
    );

    sendSuccessResponse(res, {
      message: "Password reset successfully",
      data: { user, token },
      statusCode: 200,
    });
  },
);
