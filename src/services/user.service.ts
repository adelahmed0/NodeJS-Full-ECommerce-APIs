import User, { IUser } from "../models/user.model.js";
import slugify from "@sindresorhus/slugify";
import { hashPassword } from "../utils/password.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Service to handle manual user creation (e.g., by Admin).
 * Uses the factory to standardise the process.
 */
export const createUserService = async (
  body: Partial<IUser>,
): Promise<IUser> => {
  return factory.createOne(User)(body);
};

/**
 * Service to retrieve a paginated list of users.
 * Supports searching by name and email.
 */
export const getAllUsersService = factory.getAll(User, ["name", "email"]);

/**
 * Service to fetch a single user's detailed information.
 */
export const getUserByIdService = factory.getOne(User);

/**
 * Service to handle generic updates to a user document.
 * Security Note: We explicitly remove the password field from the update body
 * to force users to use the dedicated password-change endpoint.
 */
export const updateUserService = async (
  id: string,
  body: Partial<IUser>,
): Promise<IUser | null> => {
  // Prevent password updates via this generic service
  delete body.password;

  return factory.updateOne(User)(id, body);
};

/**
 * Service dedicated to updating a user's password.
 * Handles hashing of the new password and updating the 'passwordChangedAt' timestamp.
 */
export const updateUserPasswordService = async (
  id: string,
  body: any,
): Promise<IUser | null> => {
  // Note: We use factory.updateOne while manually specifying the hashed password
  return factory.updateOne(User)(id, {
    password: await hashPassword(body.password),
    passwordChangedAt: new Date(Date.now() - 1000), // Backdate 1s to ensure JWT issued now is valid
  });
};

/**
 * Service to permanently remove a user from the system.
 */
export const deleteUserService = factory.deleteOne(User);
