/**
 * Profile Validators
 * Handles validation for user-initiated profile changes,
 * such as updating personal info or changing passwords.
 */
import { body } from "express-validator";
import slugify from "@sindresorhus/slugify";
import User from "../models/user.model.js";
import validatorMiddleware from "../middleware/validator.middleware.js";

/**
 * Validation rules for changing the authenticated user's password.
 */
export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

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

/**
 * Validation rules for updating general profile information (name, email, phone).
 * Performs duplication checks if the email is being modified.
 */
export const updateProfileValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("User name cannot be empty")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lowercase: true });
      return true;
    }),

  body("email")
    .optional()
    .notEmpty()
    .withMessage("Email cannot be empty")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .custom(async (val, { req }) => {
      // Check if email is being updated to a different email
      const currentUser = await User.findById(req.user!._id);
      if (currentUser && currentUser.email !== val) {
        const user = await User.findOne({ email: val });
        if (user) {
          return Promise.reject("E-mail already exists");
        }
      }
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
 * Validation rules for toggling user account status.
 */
export const updateStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .bail()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),

  validatorMiddleware,
];
