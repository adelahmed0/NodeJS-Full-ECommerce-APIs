import express, { Router } from "express";
import { createCashOrder } from "../controllers/order.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import multer from "multer";

const router: Router = express.Router();

// Create form-data parser for order (no files)
const parseOrderFormData = multer().none();

router.use(protect, allowedTo("user"));

router.post("/:cartId", parseOrderFormData, createCashOrder);

export default router;
