import express, { Router } from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import {
  createReviewValidator,
  getAllReviewsValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} from "../validators/review.validator.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { UserRole } from "../models/user.model.js";

const router: Router = express.Router();

router
  .route("/")
  .get(getAllReviewsValidator, getAllReviews)
  .post(protect, allowedTo(UserRole.USER), createReviewValidator, createReview);

router
  .route("/:id")
  .get(getReviewValidator, getReviewById)
  .put(protect, allowedTo(UserRole.USER), updateReviewValidator, updateReview)
  .delete(
    protect,
    allowedTo(UserRole.USER),
    deleteReviewValidator,
    deleteReview,
  );

export default router;
