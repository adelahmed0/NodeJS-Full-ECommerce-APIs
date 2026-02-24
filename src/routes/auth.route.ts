import express, { Router } from "express";
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyResetCodeValidator,
} from "../validators/auth.validator.js";
import {
  signup,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/auth.controller.js";
import { parseFormData } from "../middleware/uploadImage.middleware.js";

const router: Router = express.Router();

router.post("/signup", parseFormData(), signupValidator, signup);
router.post("/login", parseFormData(), loginValidator, login);
router.post(
  "/forgot-password",
  parseFormData(),
  forgotPasswordValidator,
  forgotPassword,
);
router.post(
  "/verify-reset-code",
  parseFormData(),
  verifyResetCodeValidator,
  verifyResetCode,
);
router.put(
  "/reset-password",
  parseFormData(),
  resetPassword,
);

export default router;
