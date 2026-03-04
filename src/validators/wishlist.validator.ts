import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Product from "../models/product.model.js";

/**
 * Check if product exists
 */
const checkProductExists = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    return Promise.reject(`Product not found with id: ${productId}`);
  }
  return true;
};

export const addToWishlistValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .bail()
    .custom(checkProductExists),

  validatorMiddleware,
];

export const getWishlistValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  validatorMiddleware,
];

export const checkProductInWishlistValidator = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format"),

  validatorMiddleware,
];

export const removeFromWishlistValidator = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .bail()
    .custom(checkProductExists),

  validatorMiddleware,
];
