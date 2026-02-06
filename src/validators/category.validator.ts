import { body, param, query, validationResult } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

export const getCategoryByIdValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID"),
  validatorMiddleware,
];

export const createCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3 })
    .withMessage("Too short category name")
    .isLength({ max: 32 })
    .withMessage("Too long category name"),
  validatorMiddleware,
];

export const updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID"),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short category name")
    .isLength({ max: 32 })
    .withMessage("Too long category name"),
  validatorMiddleware,
];

export const deleteCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID"),
  validatorMiddleware,
];
