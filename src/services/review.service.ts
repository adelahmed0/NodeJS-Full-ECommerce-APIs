import Review, { IReview } from "../models/review.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new review
 */
export const createReviewService = async (
  body: Partial<IReview>,
): Promise<IReview> => {
  return factory.createOne(Review)(body);
};

/**
 * Get all reviews with pagination and filter
 */
export const getAllReviewsService = factory.getAll(
  Review,
  ["user", "product"],
  [
    { path: "user", select: "name email" },
    { path: "product", select: "title imageCover" },
  ],
);

/**
 * Get review by ID
 */
export const getReviewByIdService = factory.getOne(Review);

/**
 * Update review by ID
 */
export const updateReviewService = async (
  id: string,
  body: Partial<IReview>,
): Promise<IReview | null> => {
  return factory.updateOne(Review)(id, body);
};

/**
 * Delete review by ID - Using Factory
 */
export const deleteReviewService = factory.deleteOne<IReview>(Review);
