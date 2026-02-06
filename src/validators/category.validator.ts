import { body, param, query, validationResult } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
export const getCategoryByIdValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID"),
  validatorMiddleware,
];
