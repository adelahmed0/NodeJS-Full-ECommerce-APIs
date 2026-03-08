import Coupon, { ICoupon } from "../models/coupon.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Service to register a new discount coupon.
 */
export const createCouponService = factory.createOne<ICoupon>(Coupon);

/**
 * Service to fetch all available coupons.
 * Supports searching by coupon name.
 */
export const getAllCouponsService = factory.getAll(Coupon, ["name"]);

/**
 * Service to fetch a single coupon by its ID.
 */
export const getCouponByIdService = factory.getOne(Coupon);

/**
 * Service to update coupon properties (e.g., expiry date, discount percentage).
 */
export const updateCouponService = factory.updateOne<ICoupon>(Coupon);

/**
 * Service to delete a coupon.
 */
export const deleteCouponService = factory.deleteOne(Coupon);
