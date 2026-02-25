import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  signupService,
  loginService,
  forgotPasswordService,
  verifyResetCodeService,
  resetPasswordService,
  getProfileService,
  changePasswordService,
  updateProfileService,
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

/**
 * @desc    Verify Reset Code
 * @route   POST /api/auth/verify-reset-code
 * @access  Public
 */
export const verifyResetCode = asyncHandler(
  async (req: Request, res: Response) => {
    await verifyResetCodeService(req.body.resetCode);
    sendSuccessResponse(res, {
      message: "Code verified successfully",
      statusCode: 200,
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
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

/**
 * @desc    Get User Profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await getProfileService(req.user!._id.toString());
  sendSuccessResponse(res, {
    message: "User profile retrieved successfully",
    data: { user },
    statusCode: 200,
  });
});

/**
 * @desc    Change User Password (for authenticated users)
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const { user, token } = await changePasswordService(
      req.user!._id.toString(),
      currentPassword,
      newPassword,
    );
    sendSuccessResponse(res, {
      message: "Password changed successfully",
      data: { user, token },
      statusCode: 200,
    });
  },
);

/**
 * @desc    Update User Profile (for authenticated users)
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await updateProfileService(req.user!._id.toString(), req.body);
    sendSuccessResponse(res, {
      message: "Profile updated successfully",
      data: { user },
      statusCode: 200,
    });
  },
);
