import { body, param, query, check } from "express-validator";
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
  check("image").custom((_val, { req }) => {
    if (!req.file) {
      throw new Error("Category image is required");
    }
    if (!req.file.mimetype.startsWith("image/")) {
      throw new Error("Only images are allowed");
    }
    return true;
  }),
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
    .withMessage("Category name must be at most 32 characters")
    .custom(async (val) => {
      const category = await Category.findOne({ name: val });
      if (category) {
        throw new Error("Category name already exists");
      }
      return true;
    }),
  check("image")
    .optional()
    .custom((_val, { req }) => {
      // If image field exists in body but no file was uploaded
      if (req.body.image !== undefined && !req.file) {
        throw new Error("Category image must be a file upload");
      }
      // If a file was uploaded, check its mimetype
      if (req.file && !req.file.mimetype.startsWith("image/")) {
        throw new Error("Only images are allowed");
      }
      return true;
    }),
  validatorMiddleware,
];

export const deleteCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID format").bail(),
  validatorMiddleware,
];
