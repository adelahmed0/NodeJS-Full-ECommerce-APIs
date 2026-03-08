/**
 * Review Validators
 * Validation logic for product reviews, ensuring users can only
 * review products once and verifying ownership for modifications.
 */
import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

/**
 * Validates that a product ID exists in the database.
 */
const checkProductExists = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    return Promise.reject(`Product not found with id: ${productId}`);
  }
  return true;
};

/**
 * Prevents multiple reviews for the same product by the same user.
 */
const checkDuplicateReview = async (productId: string, { req }: any) => {
  // Skip check for update operations
  if (req.params?.id) {
    return true;
  }

  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (existingReview) {
    return Promise.reject("You have already reviewed this product");
  }
  return true;
};

/**
 * Validation rules for submitting a new review.
 * Verifies product existence and prevents duplicate reviews.
 */
export const createReviewValidator = [
  body("title")
    .optional()
    .isString()
    .withMessage("Review title must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Review title must be at least 3 characters")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Review title must be at most 200 characters"),

  body("ratings")
    .notEmpty()
    .withMessage("Review rating is required")
    .bail()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5"),

  body("product")
    .notEmpty()
    .withMessage("Product ID is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .bail()
    .custom(checkProductExists)
    .bail()
    .custom(checkDuplicateReview),

  validatorMiddleware,
];

/**
 * Validation rules for listing reviews based on product, user, or rating.
 */
export const getAllReviewsValidator = [
  param("productId")
    .optional()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .bail()
    .custom(checkProductExists),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid page number")
    .bail(),

  query("per_page")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Invalid per_page number (max: 100)")
    .bail(),

  query("product")
    .optional()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .bail(),

  query("user")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format")
    .bail(),

  query("ratings")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating filter must be between 1 and 5")
    .bail(),

  validatorMiddleware,
];

/**
 * Validation for fetching a specific review document.
 */
export const getReviewValidator = [
  param("id").isMongoId().withMessage("Invalid review ID format").bail(),
  param("productId")
    .optional()
    .isMongoId()
    .withMessage("Invalid product ID format")
    .bail()
    .custom(async (productId, { req }) => {
      if (productId && req.params?.id) {
        const review = await Review.findById(req.params.id);
        if (!review) {
          return Promise.reject(`Review not found with id: ${req.params.id}`);
        }
        if (review.product.toString() !== productId) {
          return Promise.reject("Review does not belong to this product");
        }
      }
      return true;
    }),

  validatorMiddleware,
];

/**
 * Validation rules for updating a review.
 * Includes authorship/ownership verification to prevent unauthorized edits.
 */
export const updateReviewValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID format")
    .bail()
    .custom(async (reviewId, { req }) => {
      const review = await Review.findById(reviewId);
      if (!review) {
        return Promise.reject(`Review not found with id: ${reviewId}`);
      }

      // Check if user owns this review or is admin
      if (
        review.user.toString() !== req.user._id.toString() &&
        req.user.type !== "admin"
      ) {
        return Promise.reject("You can only update your own reviews");
      }

      return true;
    }),

  body("title")
    .optional()
    .isString()
    .withMessage("Review title must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Review title must be at least 3 characters")
    .bail()
    .isLength({ max: 200 })
    .withMessage("Review title must be at most 200 characters"),

  body("ratings")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be a number between 1 and 5"),

  validatorMiddleware,
];

/**
 * Validation rules for deleting a review.
 * Ensures only the original author or an admin can perform deletion.
 */
export const deleteReviewValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid review ID format")
    .bail()
    .custom(async (reviewId, { req }) => {
      const review = await Review.findById(reviewId);
      if (!review) {
        return Promise.reject(`Review not found with id: ${reviewId}`);
      }

      // Check if user owns this review or is admin
      if (
        review.user.toString() !== req.user._id.toString() &&
        req.user.type !== "admin"
      ) {
        return Promise.reject("You can only delete your own reviews");
      }

      return true;
    }),

  validatorMiddleware,
];
