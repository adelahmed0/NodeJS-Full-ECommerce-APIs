/**
 * Shopping Cart Routes
 * Restricted to authenticated Users. Core operations for item
 * management, clearing the cart, and applying discount coupons.
 */
import express, { Router } from "express";
import {
  addProductToCart,
  getLoggedUserCart,
  removeCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} from "../controllers/cart.controller.js";
import multer from "multer";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import {
  addProductToCartValidator,
  cartItemIdValidator,
  updateCartItemQuantityValidator,
  applyCouponValidator,
} from "../validators/cart.validator.js";

// Create form-data parser for cart (no files)
const parseCartFormData = multer().none();

const router: Router = express.Router();

router.use(protect, allowedTo("user"));

router
  /**
   * @desc    Add a product to the cart or update its quantity
   * @route   POST /api/cart
   * @access  Private/User
   */
  .post("/", parseCartFormData, addProductToCartValidator, addProductToCart)
  /**
   * @desc    Fetch the current user's shopping cart
   * @route   GET /api/cart
   * @access  Private/User
   */
  .get("/", getLoggedUserCart)
  /**
   * @desc    Remove all items from the cart
   * @route   DELETE /api/cart
   * @access  Private/User
   */
  .delete("/", clearCart);

/**
 * @desc    Apply a discount coupon to the cart total
 * @route   PUT /api/cart/applyCoupon
 * @access  Private/User
 */
router.put(
  "/applyCoupon",
  parseCartFormData,
  applyCouponValidator,
  applyCoupon,
);

/**
 * @desc    Update a specific cart item's quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private/User
 */
router.put(
  "/:itemId",
  parseCartFormData,
  updateCartItemQuantityValidator,
  updateCartItemQuantity,
);

/**
 * @desc    Remove a specific item from the cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private/User
 */
router.delete("/:itemId", cartItemIdValidator, removeCartItem);

export default router;
