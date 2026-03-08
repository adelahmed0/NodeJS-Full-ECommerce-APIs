/**
 * Review Service
 * Manages user product reviews and ratings, integrating with automated aggregation hooks.
 */
import Review, { IReview } from "../models/review.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new product review
 * @param body - Partial review data (ratings, comment, etc.)
 * @param userId - ID of the authenticated user submitting the review
 */
export const createReviewService = async (
  body: Partial<IReview>,
  userId: string,
): Promise<IReview> => {
  // Merge user ID into payload to ensure ownership
  const reviewData = {
    ...body,
    user: userId,
  };
  // Create and populate for and immediate rich-response
  return factory.createOne(Review, [
    { path: "user", select: "name email" },
    { path: "product", select: "title imageCover" },
  ])(reviewData);
};

/**
 * Fetch a list of reviews with nested user and product information
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
 * Fetch a full review document by its ID
 */
export const getReviewByIdService = factory.getOne(Review, [
  { path: "user", select: "name email" },
  { path: "product", select: "title imageCover" },
]);

/**
 * Update an existing review record
 * @param id - Document ID
 * @param body - Update payload
 */
export const updateReviewService = async (
  id: string,
  body: Partial<IReview>,
): Promise<IReview | null> => {
  // Updates trigger validation and re-fetch for population
  return factory.updateOne(Review, [
    { path: "user", select: "name email" },
    { path: "product", select: "title imageCover" },
  ])(id, body);
};

/**
 * Delete a review and trigger automated rating re-calculations in the Product model.
 */
export const deleteReviewService = factory.deleteOne(Review, [
  { path: "user", select: "name email" },
  { path: "product", select: "title imageCover" },
]);
