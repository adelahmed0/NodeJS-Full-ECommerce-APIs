import { body, param, query, validationResult } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

export const createSubCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("SubCategory name is required")
    .isLength({ min: 2 })
    .withMessage("SubCategory name must be at least 2 characters")
    .isLength({ max: 32 })
    .withMessage("SubCategory name must be at most 32 characters"),
  body("category")
    .notEmpty()
    .withMessage("SubCategory must belong to a category")
    .isMongoId()
    .withMessage("Invalid category ID format"),
  validatorMiddleware,
];

export const getAllSubCategoriesValidator = [
  param("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page number"),
  query("per_page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid per_page number"),
  validatorMiddleware,
];

export const getSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subCategory ID format"),
  validatorMiddleware,
];

export const updateSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subCategory ID format"),
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("SubCategory name must be at least 2 characters")
    .isLength({ max: 32 })
    .withMessage("SubCategory name must be at most 32 characters"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),
  validatorMiddleware,
];

export const deleteSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subCategory ID format"),
  validatorMiddleware,
];
