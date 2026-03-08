import jwt, { SignOptions } from "jsonwebtoken";

/**
 * Utility to generate a signed JSON Web Token (JWT)
 * @param payload Data to encode in the token (e.g., userId)
 * @param secret Encryption key (defaults to JWT_SECRET env)
 * @param options JWT options like expiration (defaults to JWT_EXPIRES_IN env)
 */
export const createToken = (
  payload: any,
  secret: string = process.env.JWT_SECRET!,
  options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  },
) => jwt.sign(payload, secret, options);

/**
 * Utility to verify a JWT's integrity and decode its payload
 * @param token The JWT string to verify
 * @param secret The encryption key used to sign the token
 * @returns Decoded payload if valid, throws error otherwise
 */
export const verifyToken = (
  token: string,
  secret: string = process.env.JWT_SECRET!,
) => jwt.verify(token, secret);
