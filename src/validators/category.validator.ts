import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Category from "../models/category.model.js";

export const getCategoryByIdValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID format").bail(),
  validatorMiddleware,
];

export const createCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 3 })
    .withMessage("Category name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Category name must be at most 32 characters")
    .custom(async (val) => {
      const category = await Category.findOne({ name: val });
      if (category) {
        throw new Error("Category name already exists");
      }
      return true;
    }),
  body("image")
    .optional()
    .isURL()
    .withMessage("Category image must be a valid URL"),
  validatorMiddleware,
];

export const getAllCategoriesValidator = [
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
  validatorMiddleware,
];

export const updateCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID format").bail(),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Category name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Category name must be at most 32 characters"),
  body("image")
    .optional()
    .isURL()
    .withMessage("Category image must be a valid URL"),
  validatorMiddleware,
];

export const deleteCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID format").bail(),
  validatorMiddleware,
];
