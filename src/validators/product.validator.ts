import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";

export const createProductValidator = [
  body("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Product title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Product title must be at most 100 characters"),
  body("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Product description must be at least 20 characters"),
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
    .isFloat({ max: 200000 })
    .withMessage("Product price is too high"),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .isFloat({ min: 1 })
    .withMessage("Discounted price must be at least 1")
    .custom((value, { req }) => {
      if (req.body.price && value >= req.body.price) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  body("colors")
    .optional()
    .isArray()
    .withMessage("colors should be an array of strings"),
  body("colors.*")
    .optional()
    .isString()
    .withMessage("each color must be a string"),
  body("imageCover").notEmpty().withMessage("Product imageCover is required"),
  body("images")
    .optional()
    .isArray()
    .withMessage("images should be an array of strings"),
  body("images.*")
    .optional()
    .isURL()
    .withMessage("each image must be a valid URL"),
  body("category")
    .notEmpty()
    .withMessage("Product category is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),
  body("subcategories")
    .optional()
    .isArray()
    .withMessage("subcategories should be an array"),
  body("subcategories.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID format"),
  body("brand").optional().isMongoId().withMessage("Invalid brand ID format"),
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

export const getAllProductsValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page number"),
  query("per_page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid per_page number"),
  validatorMiddleware,
];

export const getProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];

export const updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
  body("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Product title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Product title must be at most 100 characters"),
  body("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Product description must be at least 20 characters"),
  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Product price must be a number")
    .isFloat({ max: 200000 })
    .withMessage("Product price is too high"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),
  body("brand").optional().isMongoId().withMessage("Invalid brand ID format"),
  validatorMiddleware,
];

export const deleteProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];
