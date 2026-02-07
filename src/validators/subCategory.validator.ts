import { body, param, query, validationResult } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

export const createSubCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("SubCategory name is required")
    .isLength({ min: 2 })
    .withMessage("Too short subCategory name")
    .isLength({ max: 32 })
    .withMessage("Too long subCategory name"),
  body("category")
    .notEmpty()
    .withMessage("SubCategory must belong to a category")
    .isMongoId()
    .withMessage("Invalid Category ID"),
  validatorMiddleware,
];

export const getAllSubCategoriesValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page"),
  query("per_page").optional().isInt({ min: 1 }).withMessage("Invalid per_page"),
  validatorMiddleware,
];

export const getSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid SubCategory ID"),
  validatorMiddleware,
];

export const updateSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid SubCategory ID"),
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Too short subCategory name")
    .isLength({ max: 32 })
    .withMessage("Too long subCategory name"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid Category ID"),
  validatorMiddleware,
];

export const deleteSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid SubCategory ID"),
  validatorMiddleware,
];