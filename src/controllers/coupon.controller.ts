/**
 * Coupon Controller
 * Manages operations for discount coupons, including CRUD for promotional codes.
 */
import { Request, Response, RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import { IApiResponse } from "../types/api.types.js";
import {
  createCouponService,
  getAllCouponsService,
  getCouponByIdService,
  updateCouponService,
  deleteCouponService,
} from "../services/coupon.service.js";
import { ICoupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";
import * as factory from "./handlersFactory.controller.js";

/**
 * @desc    Generate a new discount coupon
 * @route   POST /api/v1/coupons
 * @access  Private/Admin
 */
export const createCoupon = factory.createOne<ICoupon, Partial<ICoupon>>(
  createCouponService, // Logic for coupon activation and expiry setup
  "Coupons",
);

/**
 * @desc    Retrieve all active coupons with pagination
 * @route   GET /api/v1/coupons
 * @access  Private/Admin
 */
export const getAllCoupons = factory.getAll<ICoupon>(
  getAllCouponsService, // Integrated with ApiFeatures sorting and searching
  "Coupon",
);

/**
 * @desc    Fetch details of a single coupon
 * @route   GET /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const getCoupon = factory.getOne<ICoupon>(
  getCouponByIdService, // Single document retrieval by ID
  "Coupon",
);

/**
 * @desc    Modify coupon data (e.g., expiry date, name, or discount)
 * @route   PUT /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = factory.updateOne<ICoupon, Partial<ICoupon>>(
  updateCouponService, // Standard update through factory layer
  "Coupon",
);

/**
 * @desc    Deactivate and delete a coupon
 * @route   DELETE /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = factory.deleteOne<ICoupon>(
  deleteCouponService, // Permanent removal from database
  "Coupon",
);
