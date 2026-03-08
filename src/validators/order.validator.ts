/**
 * Order Validators
 * Handles validation for order-related operations, including
 * payment status updates and shipping information verification.
 */
import { body, param } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import { OrderStatus } from "../models/order.model.js";

/**
 * Validation rules for generating a new cash-on-delivery order.
 * Groups shipping details into a sub-object for service compatibility.
 */
export const createCashOrderValidator = [
  param("cartId").isMongoId().withMessage("Invalid cart ID format"),

  // 1) Validate fields inside shippingAddress object (for form-data or JSON)
  body("shippingAddress.phone")
    .notEmpty()
    .withMessage("Phone number is required for shipping"),
  body("shippingAddress.city")
    .notEmpty()
    .withMessage("City is required for shipping"),
  body("shippingAddress.details").optional(),
  body("shippingAddress.postalCode").optional(),

  validatorMiddleware,
];

/**
 * Validation for fetching specific order details by ID.
 */
export const getSpecificOrderValidator = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  validatorMiddleware,
];

/**
 * Validation for updating an order's payment status to 'Paid'.
 */
export const updateOrderToPaidValidator = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  validatorMiddleware,
];

/**
 * Validation for marking an order as 'Delivered'.
 */
export const updateOrderToDeliveredValidator = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  validatorMiddleware,
];

/**
 * Validation for manually updating the overall status of an order.
 */
export const updateOrderStatusValidator = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(Object.values(OrderStatus))
    .withMessage(
      `Invalid status value. Must be one of: ${Object.values(OrderStatus).join(", ")}`,
    ),
  validatorMiddleware,
];

/**
 * Validation for cancelling an order.
 */
export const cancelOrderValidator = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  validatorMiddleware,
];
