import { body, param, query, validationResult } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

export const createSubCategoryValidator = [
  body("name")
    .notEmpty()
    .withMessage("SubCategory name is required")
    .isLength({ min: 3 })
    .withMessage("Too short subCategory name")
    .isLength({ max: 32 })
    .withMessage("Too long category name"),
  body("category")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Invalid Category ID"),
  validatorMiddleware,
];
