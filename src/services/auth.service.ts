import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/token.js";
import { comparePassword } from "../utils/password.js";
import crypto from "crypto";

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
  const resetCode = Math.floor(100000 + Math.random() * 999999).toString();
  const hashedResetCode = crypto.createHash("sha256").update(resetCode).digest("hex");
  // save hash
  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.passwordResetVerified = false;
  await user.save();
  // 3-send code to user's email
};
