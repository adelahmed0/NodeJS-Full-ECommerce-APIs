import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/token.js";
import { comparePassword } from "../utils/password.js";
import slugify from "@sindresorhus/slugify";

/**
 * Service to fetch the document of the currently logged-in user
 */
export const getProfileService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return user;
};

/**
 * Service to handle password change for an authenticated user.
 * Requires verifying the old password before setting the new one.
 */
export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  // 1) Locate the user document
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 2) Verify the current password matches the one in DB
  const isCurrentPasswordCorrect = await comparePassword(
    currentPassword,
    user.password,
  );
  if (!isCurrentPasswordCorrect) {
    throw new ApiError("Current password is incorrect", 401);
  }

  // 3) Update to new password (will be hashed by 'pre-save' hook)
  user.password = newPassword;
  await user.save();

  // 4) Issue a fresh JWT since the old one might rely on a 'passwordChangedAt' check
  const token = createToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });

  return { user, token };
};

/**
 * Service to update non-sensitive profile information for the logged-in user.
 * Explicitly blocks changes to roles/permissions.
 */
export const updateProfileService = async (
  userId: string,
  updateData: Partial<IUser>,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 1) Security Guard: Clean up the incoming data to prevent elevation of privilege
  delete updateData.password;
  delete updateData.passwordResetCode;
  delete updateData.passwordResetCodeExpires;
  delete updateData.passwordResetVerified;
  delete updateData.passwordChangedAt;
  delete updateData.type; // Only Admins can change user roles
  delete updateData.status; // Only Admins can deactivate/activate users here

  // 2) Handle Email updates: Check if the new email is already claimed by someone else
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser) {
      throw new ApiError("Email already exists", 400);
    }
  }

  // 3) Handle Name updates: Regenerate search-friendly slug
  if (updateData.name) {
    updateData.slug = slugify(updateData.name, { lowercase: true });
  }

  // 4) Persist allowed updates
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

/**
 * Simple status toggle for the user's account status
 */
export const updateStatusService = async (userId: string, status: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Validate allowed status transitions
  if (!["active", "inactive"].includes(status)) {
    throw new ApiError("Invalid status. Must be 'active' or 'inactive'", 400);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true },
  );

  return updatedUser;
};
