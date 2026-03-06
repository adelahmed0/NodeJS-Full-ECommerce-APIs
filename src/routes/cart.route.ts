import express, { Router } from "express";
import { addProductToCart } from "../controllers/cart.controller.js";
import multer from "multer";
import { protect,allowedTo } from "../middleware/auth.middleware.js";

// Create form-data parser for cart (no files)
const parseCartFormData = multer().none();

const router: Router = express.Router();

router.post("/",protect,allowedTo("user"), parseCartFormData, addProductToCart);

export default router;
