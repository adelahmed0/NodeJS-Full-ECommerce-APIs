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
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private/User
 */
export const createReview = factory.createOne<
  IReview,
  { name: string } & Partial<IReview>
>(createReviewService, "Review");

/**
 * @desc    Get all reviews
 * @route   GET /api/reviews
 * @access  Public
 */
export const getAllReviews = factory.getAll<IReview>(
  getAllReviewsService,
  "Review",
);

/**
 * @desc    Get review by ID
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReviewById = factory.getOne<IReview>(
  getReviewByIdService,
  "Review",
);

/**
 * @desc    Update review by ID
 * @route   PUT /api/reviews/:id
 * @access  Private/User
 */
export const updateReview = factory.updateOne<IReview, Partial<IReview>>(
  updateReviewService,
  "Review",
);

/**
 * @desc    Delete review by ID - Using Factory
 * @route   DELETE /api/reviews/:id
 * @access  Private/User | Admin
 */
export const deleteReview = factory.deleteOne<IReview>(
  deleteReviewService,
  "Review",
);
