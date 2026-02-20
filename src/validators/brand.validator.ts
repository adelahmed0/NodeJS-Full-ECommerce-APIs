import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Brand from "../models/brand.model.js";

export const getBrandByIdValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format").bail(),
  validatorMiddleware,
];

export const createBrandValidator = [
  body("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be at most 32 characters")
    .custom(async (val) => {
      const brand = await Brand.findOne({ name: val });
      if (brand) {
        throw new Error("Brand name already exists");
      }
      return true;
    }),
  body("image")
    .optional()
    .isURL()
    .withMessage("Brand image must be a valid URL"),
  validatorMiddleware,
];

export const getAllBrandsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid page number")
    .bail(),
  query("per_page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid per_page number")
    .bail(),
  validatorMiddleware,
];

export const updateBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format").bail(),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be at most 32 characters")
    .custom(async (val) => {
      const brand = await Brand.findOne({ name: val });
      if (brand) {
        throw new Error("Brand name already exists");
      }
      return true;
    }),
  body("image")
    .optional()
    .isURL()
    .withMessage("Brand image must be a valid URL"),
  validatorMiddleware,
];

export const deleteBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format").bail(),
  validatorMiddleware,
];
