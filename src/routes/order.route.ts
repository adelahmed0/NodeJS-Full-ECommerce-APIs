import express, { Router } from "express";
import {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  updateOrderStatus,
  checkoutSession,
} from "../controllers/order.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { filterOrderForLoggedUser } from "../services/order.service.js";
import {
  createCashOrderValidator,
  getSpecificOrderValidator,
  updateOrderToDeliveredValidator,
  updateOrderToPaidValidator,
  updateOrderStatusValidator,
} from "../validators/order.validator.js";
import multer from "multer";

const router: Router = express.Router();

// Create form-data parser for order (no files)
const parseOrderFormData = multer().none();

router.use(protect);

router.get("/checkout-session/:cartId", allowedTo("user"),parseOrderFormData, checkoutSession);

router.post(
  "/:cartId",
  allowedTo("user"),
  parseOrderFormData,
  createCashOrderValidator,
  createCashOrder,
);

router.get(
  "/",
  allowedTo("user", "admin"),
  filterOrderForLoggedUser,
  getAllOrders,
);

router.get(
  "/:id",
  allowedTo("user", "admin"),
  getSpecificOrderValidator,
  filterOrderForLoggedUser,
  getSpecificOrder,
);

router.put(
  "/:id/pay",
  allowedTo("admin", "manager"),
  updateOrderToPaidValidator,
  updateOrderToPaid,
);

router.put(
  "/:id/deliver",
  allowedTo("admin", "manager"),
  updateOrderToDeliveredValidator,
  updateOrderToDelivered,
);

router.put(
  "/:id/status",
  allowedTo("admin", "manager"),
  parseOrderFormData,
  updateOrderStatusValidator,
  updateOrderStatus,
);

export default router;
