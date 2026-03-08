/**
 * Order & Checkout Routes
 * Handles user checkouts (Cash/Stripe) and order fulfillment.
 * @access  Private/Admin
 */
import express, { Router } from "express";
import {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  updateOrderStatus,
  checkoutSession,
  cancelOrder,
} from "../controllers/order.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { filterOrderForLoggedUser } from "../services/order.service.js";
import {
  createCashOrderValidator,
  getSpecificOrderValidator,
  updateOrderToDeliveredValidator,
  updateOrderToPaidValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
} from "../validators/order.validator.js";
import multer from "multer";

const router: Router = express.Router();

// Create form-data parser for order (no files)
const parseOrderFormData = multer().none();

router.use(protect);

/**
 * @desc    Initiate a Stripe Checkout session for card payments
 * @route   POST /api/orders/checkout-session/:cartId
 * @access  Private/User
 */
router.post(
  "/checkout-session/:cartId",
  allowedTo("user"),
  parseOrderFormData,
  createCashOrderValidator,
  checkoutSession,
);

/**
 * @desc    Submit a cash-on-delivery order
 * @route   POST /api/orders/cash/:cartId
 * @access  Private/User
 */
router.post(
  "/cash/:cartId",
  allowedTo("user"),
  parseOrderFormData,
  createCashOrderValidator,
  createCashOrder,
);

/**
 * @desc    List orders (User sees only their own; Admin sees all)
 * @route   GET /api/orders
 * @access  Private/User-Admin
 */
router.get(
  "/",
  allowedTo("user", "admin"),
  filterOrderForLoggedUser,
  getAllOrders,
);

/**
 * @desc    Fetch specific order details
 * @route   GET /api/orders/:id
 * @access  Private/User-Admin
 */
router.get(
  "/:id",
  allowedTo("user", "admin"),
  getSpecificOrderValidator,
  filterOrderForLoggedUser,
  getSpecificOrder,
);

/**
 * @desc    Mark an order as paid (Manual processing)
 * @route   PUT /api/orders/:id/pay
 * @access  Private/Admin
 */
router.put(
  "/:id/pay",
  allowedTo("admin"),
  updateOrderToPaidValidator,
  updateOrderToPaid,
);

/**
 * @desc    Mark an order as successfully delivered
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 */
router.put(
  "/:id/deliver",
  allowedTo("admin"),
  updateOrderToDeliveredValidator,
  updateOrderToDelivered,
);

/**
 * @desc    Update general order status (e.g., Shipped)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
router.put(
  "/:id/status",
  allowedTo("admin"),
  parseOrderFormData,
  updateOrderStatusValidator,
  updateOrderStatus,
);

/**
 * @desc    Cancel an order and restore stock
 * @route   PUT /api/orders/cancel/:id
 * @access  Private/Admin
 */
router.put(
  "/cancel/:id",
  allowedTo("admin"),
  cancelOrderValidator,
  cancelOrder,
);

export default router;
