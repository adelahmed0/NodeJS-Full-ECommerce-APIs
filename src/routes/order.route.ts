import express, { Router } from "express";
import {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { filterOrderForLoggedUser } from "../services/order.service.js";
import multer from "multer";

const router: Router = express.Router();

// Create form-data parser for order (no files)
const parseOrderFormData = multer().none();

router.use(protect);

router.post("/:cartId", allowedTo("user"), parseOrderFormData, createCashOrder);

router.get(
  "/",
  allowedTo("user", "admin"),
  filterOrderForLoggedUser,
  getAllOrders,
);

router.get(
  "/:id",
  allowedTo("user", "admin"),
  filterOrderForLoggedUser,
  getSpecificOrder,
);

router.put("/:id/pay", allowedTo("admin"), updateOrderToPaid);

router.put("/:id/deliver", allowedTo("admin"), updateOrderToDelivered);

router.put("/:id/status", allowedTo("admin", "manager"), updateOrderStatus);

export default router;
