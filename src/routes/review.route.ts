/**
 * Review Routes
 * Handles user feedback on products. Features public viewing,
 * User-only review submission, and owner/Admin restricted modifications.
 */
import express, { Router } from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  setProductIdToBody,
} from "../controllers/review.controller.js";
import {
  createReviewValidator,
  getAllReviewsValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} from "../validators/review.validator.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import multer from "multer";
import { UserRole } from "../models/user.model.js";

// Create simple form-data parser for reviews (no files)
const parseReviewFormData = multer().none();

const router: Router = express.Router({ mergeParams: true });

router
  .route("/")
  /**
   * @desc    List all reviews (optionally filtered by productId)
   * @route   GET /api/reviews
   * @access  Public
   */
  .get(getAllReviewsValidator, getAllReviews)
  /**
   * @desc    Post a new product review
   * @route   POST /api/reviews
   * @access  Private/User
   */
  .post(
    protect,
    allowedTo(UserRole.USER),
    parseReviewFormData,
    setProductIdToBody,
    createReviewValidator,
    createReview,
  );

router
  .route("/:id")
  /**
   * @desc    Get a specific review by ID
   * @route   GET /api/reviews/:id
   * @access  Public
   */
  .get(getReviewValidator, getReviewById)
  /**
   * @desc    Update a review (owner only)
   * @route   PUT /api/reviews/:id
   * @access  Private/User
   */
  .put(
    protect,
    allowedTo(UserRole.USER),
    parseReviewFormData,
    updateReviewValidator,
    updateReview,
  )
  /**
   * @desc    Delete a review (owner or admin)
   * @route   DELETE /api/reviews/:id
   * @access  Private/User-Admin
   */
  .delete(
    protect,
    allowedTo(UserRole.USER, UserRole.ADMIN),
    deleteReviewValidator,
    deleteReview,
  );
export default router;
