/**
 * Global Router Index
 * Aggregates all modular route handlers and exposes them to the main application.
 */
import { Router } from "express";
// Import all individual modular routes
import categoryRoute from "./category.route.js";
import subCategoryRoute from "./subCategory.route.js";
import brandRoute from "./brand.route.js";
import productRoute from "./product.route.js";
import userRoute from "./user.route.js";
import authRoute from "./auth.route.js";
import profileRoute from "./profile.route.js";
import reviewRoute from "./review.route.js";
import wishlistRoute from "./wishlist.route.js";
import addressRoute from "./address.route.js";
import couponRoute from "./coupon.route.js";
import cartRoute from "./cart.route.js";
import orderRoute from "./order.route.js";

const router = Router();

/**
 * Main Router Index
 * Mounts all specialized routes to their respective path prefixes.
 */

// 1) Public & Catalog Routes
router.use("/categories", categoryRoute);
router.use("/sub-categories", subCategoryRoute);
router.use("/brands", brandRoute);
router.use("/products", productRoute);

// 2) Authentication & User Management
router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/profile", profileRoute);
router.use("/addresses", addressRoute);

// 3) Interactive & Transactional Routes
router.use("/reviews", reviewRoute);
router.use("/wishlist", wishlistRoute);
router.use("/coupons", couponRoute);
router.use("/cart", cartRoute);
router.use("/orders", orderRoute);

export default router;
