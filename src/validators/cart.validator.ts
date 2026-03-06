import { body, param } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Product from "../models/product.model.js";

/**
 * Add Product to Cart Validator
 */
export const addProductToCartValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .bail()
    .custom(async (productId, { req }) => {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      // Store product on req for subsequent validators to reuse
      req.product = product;
      return true;
    }),

  body("color")
    .notEmpty()
    .withMessage("Color is required")
    .bail()
    .custom((_value, { req }) => {
      const product = req.product;
      // If the product has no colors defined, any color is accepted
      if (!product || product.colors.length === 0) return true;

      if (!product.colors.includes(_value)) {
        throw new Error(
          `Color "${_value}" is not available. Available colors: ${product.colors.join(", ")}`,
        );
      }
      return true;
    }),

  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer")
    .bail()
    .custom((value, { req }) => {
      const product = req.product;
      if (product && Number(value) > product.quantity) {
        throw new Error(`Only ${product.quantity} items available in stock`);
      }
      return true;
    }),

  validatorMiddleware,
];

/**
 * Remove Cart Item Validator
 */
export const cartItemIdValidator = [
  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid item ID format"),

  validatorMiddleware,
];

/**
 * Update Cart Item Quantity Validator
 */
export const updateCartItemQuantityValidator = [
  param("itemId")
    .notEmpty()
    .withMessage("Item ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid item ID format"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  validatorMiddleware,
];

/**
 * Apply Coupon Validator
 */
export const applyCouponValidator = [
  body("coupon")
    .notEmpty()
    .withMessage("Coupon code is required")
    .bail()
    .isString()
    .withMessage("Coupon code must be a string")
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Coupon code must be between 3 and 50 characters"),

  validatorMiddleware,
];
