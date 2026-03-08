/**
 * Coupon Management Routes
 * Restricted to Administrators. Handles CRUD for discount
 * promotional codes with advanced time-based expiry checks.
 */
import express, { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import {
  createCouponValidator,
  getAllCouponsValidator,
  updateCouponValidator,
  couponIdValidator,
} from "../validators/coupon.validator.js";
import multer from "multer";

// Create simple form-data parser for coupons (no files)
const parseCouponFormData = multer().none();

const router: Router = express.Router();

// All routes in this file require authentication and admin role
router.use(protect);
router.use(allowedTo("admin"));

/**
 * @desc    Create coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
/**
 * @desc    Generate a new discount coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
router.post("/", parseCouponFormData, createCouponValidator, createCoupon);

/**
 * @desc    Retrieve a list of all active/expired coupons
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
router.get("/", getAllCouponsValidator, getAllCoupons);

/**
 * @desc    Find a single coupon by MongoID
 * @route   GET /api/coupons/:id
 * @access  Private/Admin
 */
router.get("/:id", couponIdValidator, getCoupon);

/**
 * @desc    Modify coupon settings (expiry, percentage, etc.)
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
router.put("/:id", parseCouponFormData, updateCouponValidator, updateCoupon);

/**
 * @desc    Invalidate and remove a coupon code
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
router.delete("/:id", couponIdValidator, deleteCoupon);

export default router;
