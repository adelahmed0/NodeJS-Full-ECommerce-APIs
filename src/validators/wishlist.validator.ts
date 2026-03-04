import { body, param } from "express-validator";
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
