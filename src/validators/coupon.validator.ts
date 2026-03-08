/**
 * Coupon Validators
 * Validates promotional discount codes, ensuring proper
 * formatting, discount ranges, and future expiry dates.
 */
import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

/**
 * Validation rules for generating a new coupon.
 * Enforces alphanumeric names and validates that expiry dates are in the future.
 */
export const createCouponValidator = [
  body("name")
    .notEmpty()
    .withMessage("Coupon name is required")
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Coupon name must be between 3 and 50 characters")
    .bail()
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage(
      "Coupon name can only contain letters, numbers, hyphens, and underscores",
    ),

  body("discount")
    .notEmpty()
    .withMessage("Discount is required")
    .bail()
    .isFloat({ min: 1, max: 500 })
    .withMessage("Discount must be between 1 and 500"),

  body("expire")
    .notEmpty()
    .withMessage("Expiry date is required")
    .bail()
    .custom((value) => {
      // Accept YYYY-MM-DD format or ISO8601 format
      const dateFormats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // YYYY-MM-DDTHH:MM:SS
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // ISO8601 with milliseconds
      ];

      const isValidFormat = dateFormats.some((format) => format.test(value));

      if (!isValidFormat) {
        throw new Error(
          "Please provide a valid date format (YYYY-MM-DD or ISO8601)",
        );
      }

      // Parse the date
      const expireDate = new Date(value);
      const now = new Date();

      if (isNaN(expireDate.getTime())) {
        throw new Error("Invalid date");
      }

      if (expireDate <= now) {
        throw new Error("Expiry date must be in the future");
      }

      return true;
    }),

  validatorMiddleware,
];

/**
 * Validation rules for modifying an existing coupon.
 */
export const updateCouponValidator = [
  param("id")
    .notEmpty()
    .withMessage("Coupon ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid coupon ID format")
    .bail(),

  body("name")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Coupon name must be between 3 and 50 characters")
    .bail()
    .matches(/^[A-Za-z0-9-_]+$/)
    .withMessage(
      "Coupon name can only contain letters, numbers, hyphens, and underscores",
    )
    .bail(),

  body("discount")
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage("Discount must be between 1 and 500")
    .bail(),

  body("expire")
    .optional()
    .custom((value) => {
      // Accept YYYY-MM-DD format or ISO8601 format
      const dateFormats = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // YYYY-MM-DDTHH:MM:SS
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, // ISO8601 with milliseconds
      ];

      const isValidFormat = dateFormats.some((format) => format.test(value));

      if (!isValidFormat) {
        throw new Error(
          "Please provide a valid date format (YYYY-MM-DD or ISO8601)",
        );
      }

      // Parse the date
      const expireDate = new Date(value);
      const now = new Date();

      if (isNaN(expireDate.getTime())) {
        throw new Error("Invalid date");
      }

      if (expireDate <= now) {
        throw new Error("Expiry date must be in the future");
      }

      return true;
    })
    .bail(),

  validatorMiddleware,
];

/**
 * Validation rules for listing and filtering coupons.
 */
export const getAllCouponsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid page number")
    .bail(),

  query("per_page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid per_page value")
    .bail(),

  query("sort")
    .optional()
    .isIn(["name", "discount", "expire", "-name", "-discount", "-expire"])
    .withMessage(
      "Sort must be one of: name, discount, expire, -name, -discount, -expire",
    )
    .bail(),

  query("search")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Search term must be between 1 and 50 characters")
    .bail(),

  validatorMiddleware,
];

/**
 * Common validator for operations involving a single coupon ID.
 */
export const couponIdValidator = [
  param("id")
    .notEmpty()
    .withMessage("Coupon ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid coupon ID format")
    .bail(),

  validatorMiddleware,
];
