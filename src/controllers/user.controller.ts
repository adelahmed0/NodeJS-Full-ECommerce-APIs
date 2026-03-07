import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { IUser } from "../models/user.model.js";
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  updateUserPasswordService,
} from "../services/user.service.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";
import { Types } from "mongoose";
import * as factory from "./handlersFactory.controller.js";
import { ApiError } from "../utils/apiError.js";

/**
 * @desc    Update user password
 * @route   PUT /api/users/:id/change-password
 * @access  Private/Admin
 */
export const updateUserPassword = asyncHandler(
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const user = await updateUserPasswordService(req.params.id, req.body);
    if (!user) {
      return next(new ApiError(`No user for this id ${req.params.id}`, 404));
    }
    sendSuccessResponse(res, {
      message: "Password updated successfully",
      data: user,
    });
  },
);

/**
 * @desc    Create user
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = factory.createOne<IUser, Partial<IUser>>(
  createUserService,
  "User",
);

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = factory.getAll<IUser>(getAllUsersService, "Users");

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
export const getUserById = factory.getOne<IUser>(getUserByIdService, "User");

/**
 * @desc    Update user by ID
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
export const updateUser = factory.updateOne<IUser, Partial<IUser>>(
  updateUserService,
  "User",
);

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = factory.deleteOne<IUser>(deleteUserService, "User");
