/**
 * Brand Validators
 * Defines validation rules for Brand-related operations, including
 * unique name checks and image file validation.
 */
import { body, param, query, check } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Brand from "../models/brand.model.js";
import slugify from "@sindresorhus/slugify";

/**
 * Validation rules for fetching a single brand by ID.
 */
export const getBrandByIdValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format").bail(),
  validatorMiddleware,
];

/**
 * Validation rules for creating a new brand.
 * Includes unique name check, slug generation, and mandatory image upload.
 */
export const createBrandValidator = [
  body("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be at most 32 characters")
    .custom(async (val, { req }) => {
      const brand = await Brand.findOne({ name: val });
      if (brand) {
        throw new Error("Brand name already exists");
      }
      req.body.slug = slugify(val, { lowercase: true });
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

/**
 * Validation rules for listing brands with pagination.
 */
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

/**
 * Validation rules for updating an existing brand.
 * Handles partial updates and ensures names remain unique.
 */
export const updateBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format").bail(),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be at most 32 characters")
    .custom(async (val, { req }) => {
      if (val) {
        const brand = await Brand.findOne({ name: val });
        if (brand && brand._id.toString() !== req.params?.id) {
          throw new Error("Brand name already exists");
        }
        req.body.slug = slugify(val, { lowercase: true });
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

/**
 * Validation rules for deleting a brand by ID.
 */
export const deleteBrandValidator = [
  param("id").isMongoId().withMessage("Invalid brand ID format").bail(),
  validatorMiddleware,
];
