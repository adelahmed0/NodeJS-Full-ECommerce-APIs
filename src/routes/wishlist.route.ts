import express, { Router } from "express";
import {
  addProductToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlist.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import {
  addToWishlistValidator,
  removeFromWishlistValidator,
} from "../validators/wishlist.validator.js";
import multer from "multer";

// Create simple form-data parser for wishlist (no files)
const parseWishlistFormData = multer().none();

const router: Router = express.Router();

// All routes in this file require authentication and user role
router.use(protect);
router.use(allowedTo("user"));

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private/User
 */
router.post(
  "/",
  parseWishlistFormData,
  addToWishlistValidator,
  addProductToWishlist,
);

/**
 * @desc    Get user wishlist
 * @route   GET /api/wishlist
 * @access  Private/User
 */
router.get("/", getWishlist);

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private/User
 */
router.delete("/:productId", removeFromWishlistValidator, removeFromWishlist);

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist
 * @access  Private/User
 */
router.delete("/", clearWishlist);

export default router;
