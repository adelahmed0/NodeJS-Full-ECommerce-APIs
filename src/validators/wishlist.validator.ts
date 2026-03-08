/**
 * Wishlist Validators
 * Validation logic for user product wishlists, ensuring
 * products exist before adding or removing them.
 */
import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Product from "../models/product.model.js";

/**
 * Verifies that the requested product ID corresponds to an existing record.
 */
const checkProductExists = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    return Promise.reject(`Product not found with id: ${productId}`);
  }
  return true;
};

/**
 * Validation rules for adding an item to the user's wishlist.
 */
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

/**
 * Validation for paginated wishlist retrieval.
 */
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

/**
 * Validation for checking if a specific product is already in the wishlist.
 */
export const checkProductInWishlistValidator = [
  param("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format"),

  validatorMiddleware,
];

/**
 * Validation for removing a product from the wishlist.
 */
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
