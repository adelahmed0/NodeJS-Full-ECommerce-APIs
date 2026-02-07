import { body, param, query, validationResult } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

export const getBrandByIdValidator = [
  param("id").isMongoId().withMessage("Invalid Brand ID"),
  validatorMiddleware,
];

export const createBrandValidator = [
  body("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3 })
    .withMessage("Too short brand name")
    .isLength({ max: 32 })
    .withMessage("Too long brand name"),
  validatorMiddleware,
];

export const getAllBrandsValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page"),
  query("per_page").optional().isInt({ min: 1 }).withMessage("Invalid per_page"),
  validatorMiddleware,
];
export const updateBrandValidator = [
  param("id").isMongoId().withMessage("Invalid Brand ID"),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short brand name")
    .isLength({ max: 32 })
    .withMessage("Too long brand name"),
  validatorMiddleware,
];

export const deleteBrandValidator = [
  param("id").isMongoId().withMessage("Invalid Brand ID"),
  validatorMiddleware,
];
