import { Router } from "express";
import categoryRouter from "./category.route.js";
import subCategoryRouter from "./subCategory.route.js";
import brandRouter from "./brand.route.js";
import productRouter from "./product.route.js";
import userRouter from "./user.route.js";
import authRouter from "./auth.route.js";
import profileRouter from "./profile.route.js";
import reviewRouter from "./review.route.js";
import wishlistRouter from "./wishlist.route.js";
import addressRouter from "./address.route.js";
import couponRouter from "./coupon.route.js";

const router = Router();

// API Routes
router.use("/categories", categoryRouter);
router.use("/sub-categories", subCategoryRouter);
router.use("/brands", brandRouter);
router.use("/products", productRouter);
router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/reviews", reviewRouter);
router.use("/wishlist", wishlistRouter);
router.use("/addresses", addressRouter);
router.use("/coupons", couponRouter);

export default router;
