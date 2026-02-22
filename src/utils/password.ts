import bcrypt from "bcryptjs";

/**
 * Hash a plain text password
 * @param password The plain text password to hash
 * @param saltRounds Number of salt rounds (default: 12)
 * @returns The hashed password
 */
export const hashPassword = async (password: string, saltRounds: number = 12) =>
  await bcrypt.hash(password, saltRounds);

/**
 * Compare a plain text password with a hashed password
 * @param password The plain text password
 * @param hashedPassword The hashed password to compare against
 * @returns Promise<boolean> indicating if they match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => await bcrypt.compare(password, hashedPassword);
