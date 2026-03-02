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
  .get(getAllReviewsValidator, getAllReviews)
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
  .get(getReviewValidator, getReviewById)
  .put(
    protect,
    allowedTo(UserRole.USER),
    parseReviewFormData,
    updateReviewValidator,
    updateReview,
  )
  .delete(
    protect,
    allowedTo(UserRole.USER, UserRole.ADMIN),
    deleteReviewValidator,
    deleteReview,
  );

export default router;
