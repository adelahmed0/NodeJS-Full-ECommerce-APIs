/**
 * Address Validators
 * Defines the validation rules for operations related to user addresses,
 * ensuring data integrity for adding, updating, and filtering addresses.
 */
import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

/**
 * Validation rules for adding a new address to a user's profile.
 * Ensures all required fields are present and follow consistent formatting.
 */
export const addAddressValidator = [
  body("alias")
    .notEmpty()
    .withMessage("Address alias is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Alias must be between 2 and 50 characters"),

  body("details")
    .notEmpty()
    .withMessage("Address details are required")
    .isLength({ min: 10, max: 200 })
    .withMessage("Details must be between 10 and 200 characters"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

  body("city")
    .notEmpty()
    .withMessage("City is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("postalCode")
    .notEmpty()
    .withMessage("Postal code is required")
    .isLength({ min: 3, max: 10 })
    .withMessage("Postal code must be between 3 and 10 characters"),

  validatorMiddleware,
];

/**
 * Validation rules for retrieving and filtering a user's address list.
 */
export const getAddressesValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  query("city")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("City filter must be between 2 and 50 characters"),
  query("alias")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Alias filter must be between 2 and 50 characters"),

  validatorMiddleware,
];

export const updateAddressValidator = [
  param("addressId")
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID format"),

  body("alias")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Alias must be between 2 and 50 characters"),

  body("details")
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage("Details must be between 10 and 200 characters"),

  body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),

  body("city")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),

  body("postalCode")
    .optional()
    .isLength({ min: 3, max: 10 })
    .withMessage("Postal code must be between 3 and 10 characters"),

  validatorMiddleware,
];

/**
 * Basic validator for operations requiring a specific address ID (MongoID format).
 */
export const addressIdValidator = [
  param("addressId")
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID format"),

  validatorMiddleware,
];
