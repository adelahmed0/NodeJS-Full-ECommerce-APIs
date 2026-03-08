/**
 * Review Controller
 * Handles user reviews for products, including integration with automated rating aggregation.
 */
import { IReview } from "../models/review.model.js";
import {
  createReviewService,
  getAllReviewsService,
  getReviewByIdService,
  updateReviewService,
  deleteReviewService,
} from "../services/review.service.js";
import * as factory from "./handlersFactory.controller.js";

/**
 * Middleware to extract product ID from URL params and attach it to request body.
 * This is used for nested routes like POST /products/:productId/reviews.
 */
export const setProductIdToBody = (req: any, res: any, next: any) => {
  if (!req.body) req.body = {};
  if (!req.body.product && req.params.productId) {
    req.body.product = req.params.productId;
  }
  next();
};

/**
 * @desc    Create a new review for a product
 * @route   POST /api/reviews
 * @access  Private/User
 */
export const createReview = async (req: any, res: any, next: any) => {
  try {
    // Service handles linking the review to the logged-in user and the targeted product
    const review = await createReviewService(req.body, req.user._id);

    // Return the created review with a 201 Created status
    res.status(201).json({
      status: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    // Delegate error handling to the global error middleware
    next(error);
  }
};

/**
 * @desc    Fetch a list of all reviews with user and product context
 * @route   GET /api/reviews
 * @access  Public
 */
export const getAllReviews = factory.getAll<IReview>(
  getAllReviewsService, // Service handles complex filtering and population
  "Reviews",
);

/**
 * @desc    Retrieve a single review by its specific ID
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReviewById = factory.getOne<IReview>(
  getReviewByIdService, // Single document fetch with population
  "Review",
);

/**
 * @desc    Update an existing review's title or ratings
 * @route   PUT /api/reviews/:id
 * @access  Private/User
 */
export const updateReview = factory.updateOne<IReview, Partial<IReview>>(
  updateReviewService, // Re-calculates product rating on save via middleware
  "Review",
);

/**
 * @desc    Delete a review and trigger rating re-calculation
 * @route   DELETE /api/reviews/:id
 * @access  Private/User | Admin
 */
export const deleteReview = factory.deleteOne<IReview>(
  deleteReviewService, // Triggers pre-remove hooks for aggregation
  "Review",
);
