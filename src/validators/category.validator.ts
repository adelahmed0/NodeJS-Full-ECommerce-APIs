import { body, param, query, validationResult } from "express-validator";

export const getCategoryByIdValidator = [
  param("id").isMongoId().withMessage("Invalid Category ID"),
];
