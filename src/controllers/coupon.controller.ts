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
 * @desc    Create coupon
 * @route   POST /api/v1/coupons
 * @access  Private/Admin
 */
export const createCoupon = factory.createOne<ICoupon, Partial<ICoupon>>(
  createCouponService,
  "Coupon",
);

/**
 * @desc    Get all coupons
 * @route   GET /api/v1/coupons
 * @access  Private/Admin
 */
export const getAllCoupons = factory.getAll<ICoupon>(
  getAllCouponsService,
  "Coupon",
);

/**
 * @desc    Get coupon by ID
 * @route   GET /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const getCoupon = factory.getOne<ICoupon>(
  getCouponByIdService,
  "Coupon",
);

/**
 * @desc    Update coupon by ID
 * @route   PUT /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = factory.updateOne<ICoupon, Partial<ICoupon>>(
  updateCouponService,
  "Coupon",
);

/**
 * @desc    Delete coupon by ID
 * @route   DELETE /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = factory.deleteOne<ICoupon>(
  deleteCouponService,
  "Coupon",
);
