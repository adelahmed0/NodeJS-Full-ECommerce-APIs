/**
 * Authentication Validators
 * Handles validation for user registration, login, and password recovery flows.
 */
import { body } from "express-validator";
import slugify from "@sindresorhus/slugify";
import User from "../models/user.model.js";
import validatorMiddleware from "../middleware/validator.middleware.js";

/**
 * Validation rules for user signup.
 * Checks for unique email and matching passwords.
 */
export const signupValidator = [
  body("name")
    .notEmpty()
    .withMessage("User name is required")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lowercase: true });
      return true;
    }),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        return Promise.reject("E-mail already exists");
      }
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .bail()
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  body("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      "Invalid phone number. Only Egyptian and Saudi numbers are accepted",
    ),

  validatorMiddleware,
];

/**
 * Validation rules for user login.
 */
export const loginValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
];

/**
 * Validation rules for initiating the forgot password process.
 */
export const forgotPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  validatorMiddleware,
];

/**
 * Validation rules for verifying the 6-digit reset code.
 */
export const verifyResetCodeValidator = [
  body("resetCode")
    .notEmpty()
    .withMessage("Reset code is required")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 digits"),

  validatorMiddleware,
];

/**
 * Validation rules for resetting the password after code verification.
 */
export const resetPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("newPasswordConfirm")
    .notEmpty()
    .withMessage("New password confirmation is required")
    .bail()
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),

  validatorMiddleware,
];
