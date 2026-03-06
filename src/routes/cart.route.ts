import express, { Router } from "express";
import {
  addProductToCart,
  getLoggedUserCart,
  removeCartItem,
} from "../controllers/cart.controller.js";
import multer from "multer";
import { protect, allowedTo } from "../middleware/auth.middleware.js";

// Create form-data parser for cart (no files)
const parseCartFormData = multer().none();

const router: Router = express.Router();

router.use(protect, allowedTo("user"));

router
  .post("/", parseCartFormData, addProductToCart)
  .get("/", getLoggedUserCart);

router.delete("/:itemId", removeCartItem);

export default router;
