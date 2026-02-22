import jwt from "jsonwebtoken";

const createToken = (payload: any) =>
  jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export default createToken;
