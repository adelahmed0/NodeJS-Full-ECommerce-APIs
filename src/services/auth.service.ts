import { NextFunction } from "express";
import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/token.js";

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
export const loginService = async (body: IUser, next: NextFunction) => {
  // 1-check if password and email are provided
  // 2-check if user exists
  const user = await User.findOne({ email: body.email });
  if (!user) {
    return next(new ApiError("Invalid email or password", 400));
  }
  // 3-check if password is correct
  // 4-create token
  // 5-return user and token
};
