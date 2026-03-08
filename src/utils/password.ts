/**
 * Password Utility
 * Provides asynchronous functions for secure password hashing and comparison using bcrypt.
 */
import bcrypt from "bcryptjs";

/**
 * Generates a secure hash for a plain text password.
 * Uses bcrypt's salt-based hashing to prevent rainbow table attacks.
 *
 * @param password - The plain text password string to be hashed
 * @param saltRounds - The cost factor (log2 iterations). Default is 12 for a good balance between security and performance.
 * @returns A promise that resolves to the final hashed password string.
 */
export const hashPassword = async (
  password: string,
  saltRounds: number = 12,
): Promise<string> => await bcrypt.hash(password, saltRounds);

/**
 * Validates a plain text password against a stored hash.
 * This comparison is timing-attack safe.
 *
 * @param password - The plain text password provided by the user during login
 * @param hashedPassword - The previously generated hash stored in the database
 * @returns A promise that resolves to a boolean (true if the password matches the hash, false otherwise).
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => await bcrypt.compare(password, hashedPassword);
