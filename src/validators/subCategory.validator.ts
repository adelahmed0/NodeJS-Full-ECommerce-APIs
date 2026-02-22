import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import slugify from "@sindresorhus/slugify";

export const createSubCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("SubCategory name is required")
    .bail()
    .isLength({ min: 2 })
    .withMessage("SubCategory name must be at least 2 characters")
    .isLength({ max: 32 })
    .withMessage("SubCategory name must be at most 32 characters")
    .custom(async (val, { req }) => {
      const subCategory = await SubCategory.findOne({ name: val });
      if (subCategory) {
        throw new Error("SubCategory name already exists");
      }
      req.body.slug = slugify(val, { lowercase: true });
      return true;
    }),
  body("category")
    .notEmpty()
    .withMessage("SubCategory must belong to a category")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .bail()
    .custom(async (val) => {
      const category = await Category.findById(val);
      if (!category) {
        return Promise.reject(`Category not found with id: ${val}`);
      }
      return true;
    }),
  validatorMiddleware,
];

export const getAllSubCategoriesValidator = [
  param("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .bail()
    .custom(async (val) => {
      const category = await Category.findById(val);
      if (!category) {
        return Promise.reject(`Category not found with id: ${val}`);
      }
      return true;
    }),
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page number"),
  query("per_page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid per_page number"),
  validatorMiddleware,
];

export const getSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subCategory ID format").bail(),
  validatorMiddleware,
];

export const updateSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subCategory ID format").bail(),
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("SubCategory name must be at least 2 characters")
    .isLength({ max: 32 })
    .withMessage("SubCategory name must be at most 32 characters")
    .custom(async (val, { req }) => {
      if (val) {
        const subCategory = await SubCategory.findOne({ name: val });
        if (subCategory && subCategory._id.toString() !== req.params?.id) {
          throw new Error("SubCategory name already exists");
        }
        req.body.slug = slugify(val, { lowercase: true });
      }
      return true;
    }),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .bail()
    .custom(async (val) => {
      const category = await Category.findById(val);
      if (!category) {
        return Promise.reject(`Category not found with id: ${val}`);
      }
      return true;
    }),
  validatorMiddleware,
];

export const deleteSubCategoryValidator = [
  param("id").isMongoId().withMessage("Invalid subCategory ID format").bail(),
  validatorMiddleware,
];
