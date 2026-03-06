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

// Create form-data parser for cart (no files)
const parseCartFormData = multer().none();

const router: Router = express.Router();

router.use(protect, allowedTo("user"));

router
  .post("/", parseCartFormData, addProductToCart)
  .get("/", getLoggedUserCart)
  .delete("/", clearCart);

router.put("/applyCoupon", parseCartFormData, applyCoupon);

router.put("/:itemId", parseCartFormData, updateCartItemQuantity);
router.delete("/:itemId", removeCartItem);

export default router;
