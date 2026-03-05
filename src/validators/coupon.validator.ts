import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

/**
 * Create Coupon Validator
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
    .isISO8601()
    .withMessage("Please provide a valid date (ISO8601 format)")
    .bail()
    .custom((value) => {
      const expireDate = new Date(value);
      const now = new Date();
      if (expireDate <= now) {
        throw new Error("Expiry date must be in the future");
      }
      return true;
    }),

  validatorMiddleware,
];

/**
 * Update Coupon Validator
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
    .isISO8601()
    .withMessage("Please provide a valid date (ISO8601 format)")
    .bail()
    .custom((value) => {
      const expireDate = new Date(value);
      const now = new Date();
      if (expireDate <= now) {
        throw new Error("Expiry date must be in the future");
      }
      return true;
    }),

  validatorMiddleware,
];

/**
 * Get All Coupons Validator
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
 * Get/Delete Coupon Validator
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
