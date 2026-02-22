import jwt, { SignOptions } from "jsonwebtoken";

/**
 * Generic function to create any JWT token
 */
export const createToken = (
  payload: any,
  secret: string = process.env.JWT_SECRET!,
  options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  },
) => jwt.sign(payload, secret, options);
