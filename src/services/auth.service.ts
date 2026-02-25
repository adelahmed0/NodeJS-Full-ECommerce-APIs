import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/token.js";
import { comparePassword } from "../utils/password.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import slugify from "@sindresorhus/slugify";

// @desc    Signup
// @route   POST /api/auth/signup
// @access  Public
export const signupService = async (body: IUser) => {
  const user = await User.create(body);
  const token = createToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });
  return { user, token };
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
export const loginService = async (body: IUser) => {
  // 1-check if user exists & check if password is correct
  const user = await User.findOne({ email: body.email });
  if (!user || !(await comparePassword(body.password, user.password))) {
    throw new ApiError("Invalid email or password", 401);
  }

  // 2-create token
  const token = createToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });

  // 3-return user and token
  return { user, token };
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPasswordService = async (body: IUser) => {
  // 1-check if user exists
  const user = await User.findOne({ email: body.email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  // 2-generate hash random 6-digit code and save it in database
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // save hash
  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetVerified = false;
  await user.save();
  // 3-send code to user's email
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2d3436; margin-bottom: 10px;">Reset Your Password</h1>
        <p style="color: #636e72; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
        <p style="color: #636e72; font-size: 16px;">We received a request to reset the password for your account. No changes have been made yet.</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
        <span style="display: block; font-size: 14px; text-transform: uppercase; color: #b2bec3; letter-spacing: 2px; margin-bottom: 10px;">Verification Code</span>
        <div style="font-size: 42px; font-weight: bold; color: #0984e3; letter-spacing: 5px;">${resetCode}</div>
        <p style="color: #a29bfe; font-size: 13px; margin-top: 15px;">Enter this code in the app to complete the reset process.</p>
        <p style="color: #ff7675; font-size: 12px; margin-top: 5px;"><strong>Note:</strong> This code is valid for one-time use only.</p>
      </div>
      
      <div style="color: #636e72; font-size: 14px; line-height: 1.6;">
        <p>For your security, this code will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; color: #b2bec3;">Best regards,<br><strong>The E-Commerce Team</strong></p>
        <p style="font-size: 12px; text-align: center; color: #dfe6e9; margin-top: 20px;">© ${new Date().getFullYear()} E-Commerce App. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Security: Your Password Reset Code",
      message: `Hi ${user.name}, your reset code is ${resetCode}`,
      html: html,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    throw new ApiError("Failed to send email", 500);
  }
};

// @desc    Verify Reset Code
// @route   POST /api/auth/verify-reset-code
// @access  Public
export const verifyResetCodeService = async (resetCode: string) => {
  // 1) get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError("Invalid or expired reset code", 401);
  }
  // 2) mark reset code as verified
  user.passwordResetVerified = true;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  await user.save();
};

export const resetPasswordService = async (
  email: string,
  newPassword: string,
) => {
  // 1) get user based on email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("There is no account with this email", 404);
  }
  // 2) check if reset code is verified
  if (!user.passwordResetVerified) {
    throw new ApiError("Reset code not verified", 401);
  }
  user.password = newPassword;
  user.passwordResetVerified = undefined;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  await user.save();
  // 3) create token
  const token = createToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });
  return { user, token };
};

// @desc    Get User Profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfileService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return user;
};

// @desc    Change User Password (for authenticated users)
// @route   PUT /api/auth/change-password
// @access  Private
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

// @desc    Update User Profile (for authenticated users)
// @route   PUT /api/auth/update-profile
// @access  Private
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
