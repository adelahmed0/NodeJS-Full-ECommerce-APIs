import User, { IUser } from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

// @desc    Signup
// @route   POST /api/auth/signup
// @access  Public
export const signupService = async (body: IUser) => {
  const user = await User.create(body);
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    type: user.type,
  });
  return { user, token };
};
