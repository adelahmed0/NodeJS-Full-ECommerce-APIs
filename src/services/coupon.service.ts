import Coupon, { ICoupon } from "../models/coupon.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new coupon
 */
export const createCouponService = factory.createOne<ICoupon>(Coupon);

/**
 * Get all coupons
 */
export const getAllCouponsService = factory.getAll(Coupon, ["name"]);

/**
 * Get coupon by ID
 */
export const getCouponByIdService = factory.getOne(Coupon);

/**
 * Update coupon by ID
 */
export const updateCouponService = factory.updateOne<ICoupon>(Coupon);

/**
 * Delete coupon by ID
 */
export const deleteCouponService = factory.deleteOne(Coupon);
