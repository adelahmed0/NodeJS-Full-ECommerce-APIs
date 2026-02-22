import { body, param } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import User from "../models/user.model.js";
import slugify from "@sindresorhus/slugify";

export const createUserValidator = [
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
        return Promise.reject("E-mail is already exists");
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
      "Invalid phone number only Egyptian and Saudi phone numbers are accepted",
    ),
  body("type")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Invalid user type"),
  body("active")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
  validatorMiddleware,
];

export const getUserValidator = [
  param("id").isMongoId().withMessage("Invalid User ID format").bail(),
  validatorMiddleware,
];

export const updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid User ID format").bail(),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      if (val) {
        req.body.slug = slugify(val, { lowercase: true });
      }
      return true;
    }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user && user._id.toString() !== req.params?.id) {
        return Promise.reject("E-mail already in use");
      }
    }),
  body("password")
    .optional()
    .custom((val) => {
      if (val) {
        throw new Error("This endpoint is not for password updates");
      }
      return true;
    }),
  body("passwordConfirm")
    .optional()
    .custom((val) => {
      if (val) {
        throw new Error("This endpoint is not for password updates");
      }
      return true;
    }),
  body("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage(
      "Invalid phone number only Egyptian and Saudi phone numbers are accepted",
    ),
  body("avatar").optional(),
  body("type")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Invalid user type"),
  body("active")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
  validatorMiddleware,
];

export const deleteUserValidator = [
  param("id").isMongoId().withMessage("Invalid User ID format").bail(),
  validatorMiddleware,
];
