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
 * @desc    Fetch the profile of the currently logged-in user
 * @route   GET /api/profile
 * @access  Private/Authenticated
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  // Use the user ID from the 'protect' middleware
  const user = await getProfileService(req.user!._id.toString());

  sendSuccessResponse(res, {
    message: "User profile retrieved successfully",
    data: { user },
    statusCode: 200,
  });
});

/**
 * @desc    Allow a logged-in user to change their own password
 * @route   PUT /api/profile/change-password
 * @access  Private/Authenticated
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    /**
     * Service handles:
     * 1. Verifying current password matches DB
     * 2. Hashing new password
     * 3. Issuing a fresh JWT
     */
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
 * @desc    Allow a logged-in user to update their own basic profile data
 * @route   PUT /api/profile/update-profile
 * @access  Private/Authenticated
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    // Service handles field merging and validation
    const user = await updateProfileService(req.user!._id.toString(), req.body);

    sendSuccessResponse(res, {
      message: "Profile updated successfully",
      data: { user },
      statusCode: 200,
    });
  },
);

/**
 * @desc    Update user availability or custom status string
 * @route   PUT /api/profile/update-status
 * @access  Private/Authenticated
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
