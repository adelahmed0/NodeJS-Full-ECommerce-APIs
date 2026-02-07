import { body, param, query, validationResult } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

export const getBrandByIdValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format"),
  validatorMiddleware,
];

export const createBrandValidator = [
  body("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be at most 32 characters"),
  body("image")
    .optional()
    .isURL()
    .withMessage("Brand image must be a valid URL"),
  validatorMiddleware,
];

export const getAllBrandsValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page number"),
  query("per_page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid per_page number"),
  validatorMiddleware,
];

export const updateBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format"),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be at most 32 characters"),
  body("image")
    .optional()
    .isURL()
    .withMessage("Brand image must be a valid URL"),
  validatorMiddleware,
];

export const deleteBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format"),
  validatorMiddleware,
];
