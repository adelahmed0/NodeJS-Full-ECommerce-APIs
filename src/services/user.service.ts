import User, { IUser } from "../models/user.model.js";
import slugify from "@sindresorhus/slugify";
import { hashPassword } from "../utils/password.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new user
 */
export const createUserService = async (
  body: Partial<IUser>,
): Promise<IUser> => {
  return factory.createOne(User)(body);
};

/**
 * Get all users with pagination and filter
 */
export const getAllUsersService = factory.getAll(User, ["name", "email"]);

/**
 * Get user by ID
 */
export const getUserByIdService = factory.getOne(User);

/**
 * Update user by ID
 */
export const updateUserService = async (
  id: string,
  body: Partial<IUser>,
): Promise<IUser | null> => {
  // 1- Delete password if exists
  delete body.password;

  return factory.updateOne(User)(id, body);
};

/**
 * Update user password
 */
export const updateUserPasswordService = async (
  id: string,
  body: any,
): Promise<IUser | null> => {
  return factory.updateOne(User)(id, {
    password: await hashPassword(body.password),
    passwordChangedAt: new Date(Date.now() - 1000),
  });
};

/**
 * Delete user by ID
 */
export const deleteUserService = factory.deleteOne(User);
