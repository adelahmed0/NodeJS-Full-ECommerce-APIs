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
router.post("/", parseCouponFormData, createCouponValidator, createCoupon);

/**
 * @desc    Get all coupons
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
router.get("/", getAllCouponsValidator, getAllCoupons);

/**
 * @desc    Get coupon by ID
 * @route   GET /api/coupons/:id
 * @access  Private/Admin
 */
router.get("/:id", couponIdValidator, getCoupon);

/**
 * @desc    Update coupon by ID
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
router.put("/:id", parseCouponFormData, updateCouponValidator, updateCoupon);

/**
 * @desc    Delete coupon by ID
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
router.delete("/:id", couponIdValidator, deleteCoupon);

export default router;
