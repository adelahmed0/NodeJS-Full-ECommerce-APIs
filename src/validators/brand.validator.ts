import { body, param, query, check } from "express-validator";
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
  check("image").custom((_val, { req }) => {
    if (!req.file) {
      throw new Error("Brand image is required");
    }
    if (!req.file.mimetype.startsWith("image/")) {
      throw new Error("Only images are allowed");
    }
    return true;
  }),
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
  check("image")
    .optional()
    .custom((_val, { req }) => {
      // If image field exists in body but no file was uploaded
      if (req.body.image !== undefined && !req.file) {
        throw new Error("Brand image must be a file upload");
      }
      // If a file was uploaded, check its mimetype
      if (req.file && !req.file.mimetype.startsWith("image/")) {
        throw new Error("Only images are allowed");
      }
      return true;
    }),
  validatorMiddleware,
];

export const deleteBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format").bail(),
  validatorMiddleware,
];
