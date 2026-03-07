import { IReview } from "../models/review.model.js";
import {
  createReviewService,
  getAllReviewsService,
  getReviewByIdService,
  updateReviewService,
  deleteReviewService,
} from "../services/review.service.js";
import * as factory from "./handlersFactory.controller.js";

export const setProductIdToBody = (req: any, res: any, next: any) => {
  if (!req.body) req.body = {};
  if (!req.body.product && req.params.productId)
    req.body.product = req.params.productId;
  next();
};

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private/User
 */
export const createReview = async (req: any, res: any, next: any) => {
  try {
    const review = await createReviewService(req.body, req.user._id);
    res.status(201).json({
      status: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews
 * @route   GET /api/reviews
 * @access  Public
 */
export const getAllReviews = factory.getAll<IReview>(
  getAllReviewsService,
  "Reviews",
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
