import { NextFunction } from "express";
import User, { IUser } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { createToken } from "../utils/token.js";
import { comparePassword } from "../utils/password.js";

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
