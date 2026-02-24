import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/token.js";
import { comparePassword } from "../utils/password.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

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
