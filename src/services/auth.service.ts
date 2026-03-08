import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/token.js";
import { comparePassword } from "../utils/password.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import slugify from "@sindresorhus/slugify";

/**
 * Handle user registration logic
 * @param body - User data from request
 */
export const signupService = async (body: IUser) => {
  // Create user in DB (password hashing happens in model pre-save hook)
  const user = await User.create(body);

  // Issue a JWT for the new user
  const token = createToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });

  return { user, token };
};

/**
 * Handle user login logic
 * @param body - Credentials (email, password)
 */
export const loginService = async (body: IUser) => {
  // 1) Find user and check if password is correct
  const user = await User.findOne({ email: body.email });

  // Use a timing-safe comparison via bcrypt (wrapped in comparePassword)
  if (!user || !(await comparePassword(body.password, user.password))) {
    throw new ApiError("Invalid email or password", 401);
  }

  // 2) Generate session token
  const token = createToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });

  // 3) Return user profile and token
  return { user, token };
};

/**
 * Initiate password reset by generating a 6-digit code and emailing it
 * @param body - Object containing the user's email
 */
export const forgotPasswordService = async (body: IUser) => {
  // 1) Verify user exists
  const user = await User.findOne({ email: body.email });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 2) Generate a random 6-digit code and its hash
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hash and expiry to user document (expires in 10 mins)
  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetVerified = false;
  await user.save();

  // 3) Prepare and send email with the formatted HTML template
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
    // Cleanup security fields if email delivery fails
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    throw new ApiError("Failed to send email. Please try again later.", 500);
  }
};

/**
 * Verify if the provided reset code matches the one stored in DB and hasn't expired
 * @param resetCode - Plain text code from user
 */
export const verifyResetCodeService = async (resetCode: string) => {
  // 1) Hash the incoming code to compare with stored hash
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Find user with valid code and within expiry time
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Invalid or expired reset code", 401);
  }

  // 2) Mark as verified to allow the actual password change in the next step
  user.passwordResetVerified = true;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  await user.save();
};

/**
 * Finalize password reset by saving the new password
 * @param email - User's email
 * @param newPassword - New password string
 */
export const resetPasswordService = async (
  email: string,
  newPassword: string,
) => {
  // 1) Get user based on email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError("There is no account associated with this email", 404);
  }

  // 2) Pre-condition: User MUST have passed the code verification step
  if (!user.passwordResetVerified) {
    throw new ApiError("Please verify your reset code first", 401);
  }

  // Set new password (will be hashed by model hook)
  user.password = newPassword;
  user.passwordResetVerified = undefined;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  await user.save();

  // 3) Re-authenticate user immediately after reset
  const token = createToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });

  return { user, token };
};
