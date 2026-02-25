import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  getProfileService,
  changePasswordService,
  updateProfileService,
  updateStatusService,
} from "../services/profile.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

/**
 * @desc    Get User Profile
 * @route   GET /api/profile
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
 * @route   PUT /api/profile/change-password
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
 * @route   PUT /api/profile/update-profile
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

/**
 * @desc    Update User Status (for authenticated users)
 * @route   PUT /api/profile/update-status
 * @access  Private
 */
export const updateStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;
    const user = await updateStatusService(req.user!._id.toString(), status);
    sendSuccessResponse(res, {
      message: "Status updated successfully",
      data: { user },
      statusCode: 200,
    });
  },
);
