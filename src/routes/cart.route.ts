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
  .post("/", parseCartFormData, addProductToCartValidator, addProductToCart)
  .get("/", getLoggedUserCart)
  .delete("/", clearCart);

router.put(
  "/applyCoupon",
  parseCartFormData,
  applyCouponValidator,
  applyCoupon,
);

router.put(
  "/:itemId",
  parseCartFormData,
  updateCartItemQuantityValidator,
  updateCartItemQuantity,
);
router.delete("/:itemId", cartItemIdValidator, removeCartItem);

export default router;
