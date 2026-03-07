import { body, param } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import { OrderStatus } from "../models/order.model.js";

export const createCashOrderValidator = [
  param("cartId").isMongoId().withMessage("Invalid cart ID format"),
  body("details").optional(),
  body("phone").notEmpty().withMessage("Phone number is required for shipping"),
  body("city").notEmpty().withMessage("City is required for shipping"),
  body("postalCode").optional(),
  // Group fields into shippingAddress object for the controller/service
  (req: any, res: any, next: any) => {
    req.body.shippingAddress = {
      details: req.body.details,
      phone: req.body.phone,
      city: req.body.city,
      postalCode: req.body.postalCode,
    };
    next();
  },
  validatorMiddleware,
];

export const getSpecificOrderValidator = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  validatorMiddleware,
];

export const updateOrderToPaidValidator = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  validatorMiddleware,
];

export const updateOrderToDeliveredValidator = [
  param("id").isMongoId().withMessage("Invalid order ID format"),
  validatorMiddleware,
];

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
