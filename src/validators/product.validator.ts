import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";

export const createProductValidator = [
  body("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Too short product title")
    .isLength({ max: 100 })
    .withMessage("Too long product title"),
  body("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Too short product description"),
  body("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  body("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number"),
  body("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  body("colors")
    .optional()
    .isArray()
    .withMessage("colors should be array of string"),
  body("colors.*").optional().isString().withMessage("color must be a string"),
  body("imageCover").notEmpty().withMessage("Product imageCover is required"),
  body("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  body("images.*").optional().isURL().withMessage("images must be a valid URL"),
  body("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID format"),
  body("subcategories")
    .optional()
    .isArray()
    .withMessage("subcategories should be an array"),
  body("subcategories.*").isMongoId().withMessage("Invalid ID format"),
  body("brand").optional().isMongoId().withMessage("Invalid ID format"),
  body("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),
  body("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  validatorMiddleware,
];

export const getProductValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

export const updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  body("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short product title")
    .isLength({ max: 100 })
    .withMessage("Too long product title"),
  validatorMiddleware,
];

export const deleteProductValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];
