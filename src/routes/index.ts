import { Router } from "express";
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

const router = Router();

// API Routes
router.use("/categories", categoryRoute);
router.use("/sub-categories", subCategoryRoute);
router.use("/brands", brandRoute);
router.use("/products", productRoute);
router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/profile", profileRoute);
router.use("/reviews", reviewRoute);
router.use("/wishlist", wishlistRoute);
router.use("/addresses", addressRoute);
router.use("/coupons", couponRoute);
router.use("/cart", cartRoute);

export default router;
