import express, { Router } from "express";
import { addProductToWishlist } from "../controllers/wishlist.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { addToWishlistValidator } from "../validators/wishlist.validator.js";
import { parseFormData } from "../middleware/uploadImage.middleware.js";

const router: Router = express.Router();


/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist
 * @access  Private/User
 */
router.post(
  "/",
  protect,
  allowedTo("user"),
  parseFormData,
  addToWishlistValidator,
  addProductToWishlist,
);

export default router;
