import express, { Router } from "express";
import {
  createCashOrder,
  getAllOrders,
} from "../controllers/order.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { filterOrderForLoggedUser } from "../services/order.service.js";
import multer from "multer";

const router: Router = express.Router();

// Create form-data parser for order (no files)
const parseOrderFormData = multer().none();

router.use(protect);

router.get(
  "/",
  allowedTo("user", "admin"),
  filterOrderForLoggedUser,
  getAllOrders,
);

router.post("/:cartId", allowedTo("user"), parseOrderFormData, createCashOrder);

export default router;
