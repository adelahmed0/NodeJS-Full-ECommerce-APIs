import { IUser } from "../models/user.model.js";
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";
import * as factory from "./handlersFactory.controller.js";

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
export const getAllUsers = factory.getAll<IUser>(getAllUsersService, "User");

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
