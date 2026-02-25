import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/token.js";
import { comparePassword } from "../utils/password.js";
import slugify from "@sindresorhus/slugify";

/**
 * @desc    Get User Profile
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfileService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return user;
};

/**
 * @desc    Change User Password (for authenticated users)
 * @route   PUT /api/profile/change-password
 * @access  Private
 */
export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  // 1) Get user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 2) Check if current password is correct
  const isCurrentPasswordCorrect = await comparePassword(
    currentPassword,
    user.password,
  );
  if (!isCurrentPasswordCorrect) {
    throw new ApiError("Current password is incorrect", 401);
  }

  // 3) Update password
  user.password = newPassword;
  await user.save();

  // 4) Create new token
  const token = createToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });

  return { user, token };
};

/**
 * @desc    Update User Profile (for authenticated users)
 * @route   PUT /api/profile/update-profile
 * @access  Private
 */
export const updateProfileService = async (
  userId: string,
  updateData: Partial<IUser>,
) => {
  // 1) Get user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 2) Remove sensitive fields that shouldn't be updated here
  delete updateData.password;
  delete updateData.passwordResetCode;
  delete updateData.passwordResetCodeExpires;
  delete updateData.passwordResetVerified;
  delete updateData.passwordChangedAt;
  delete updateData.type; // Only admin can change user type
  delete updateData.status; // Only admin can change user status

  // 3) Handle email uniqueness check if email is being updated
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser) {
      throw new ApiError("Email already exists", 400);
    }
  }

  // 4) Handle name update and slug generation
  if (updateData.name) {
    updateData.slug = slugify(updateData.name, { lowercase: true });
  }

  // 5) Update user
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

/**
 * @desc    Update User Status (for authenticated users)
 * @route   PUT /api/profile/update-status
 * @access  Private
 */
export const updateStatusService = async (userId: string, status: string) => {
  // 1) Get user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 2) Validate status
  if (!["active", "inactive"].includes(status)) {
    throw new ApiError("Invalid status. Must be 'active' or 'inactive'", 400);
  }

  // 3) Update user status
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true },
  );

  return updatedUser;
};
