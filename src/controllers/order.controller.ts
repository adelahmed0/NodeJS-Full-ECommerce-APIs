import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  createCashOrderService,
  getAllOrdersService,
  getSpecificOrderService,
  updateOrderToDeliveredService,
  updateOrderToPaidService,
  updateOrderStatusService,
  createStripeCheckoutSessionService,
} from "../services/order.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";
import * as factory from "./handlersFactory.controller.js";

/**
 * @desc    create cash order
 * @route   POST /api/orders/:cartId
 * @access  Protected/User
 */
export const createCashOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartId } = req.params;
    const { shippingAddress } = req.body;

    const order = await createCashOrderService(
      req.user!._id.toString(),
      cartId as string,
      shippingAddress,
    );

    sendSuccessResponse(res, {
      message: "Order created successfully",
      data: order,
      statusCode: 201,
    });
  },
);

/**
 * @desc    Get checkout session from stripe and send it as response
 * @route   GET /api/orders/checkout-session/:cartId
 * @access  Protected/User
 */
export const checkoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartId } = req.params;
    const { shippingAddress } = req.body;

    const successUrl = `${req.protocol}://${req.get("host")}/orders`;
    const cancelUrl = `${req.protocol}://${req.get("host")}/cart`;

    const session = await createStripeCheckoutSessionService(
      req.user!.email!,
      cartId as string,
      shippingAddress,
      successUrl,
      cancelUrl,
    );

    sendSuccessResponse(res, {
      message: "Checkout session created successfully",
      data: session,
    });
  },
);

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Protected/User-Admin
 */
export const getAllOrders = factory.getAll(getAllOrdersService, "Orders");

/**
 * @desc    Get specific order
 * @route   GET /api/orders/:id
 * @access  Protected/User-Admin
 */
export const getSpecificOrder = factory.getOne(
  getSpecificOrderService,
  "Order",
);

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Protected/Admin-Manager
 */
export const updateOrderToPaid = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await updateOrderToPaidService(id as string);
    sendSuccessResponse(res, {
      message: "Order paid successfully",
      data: order,
    });
  },
);

/**
 * @desc    Update order to delivered
 * @route   PUT /api/orders/:id/deliver
 * @access  Protected/Admin-Manager
 */
export const updateOrderToDelivered = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await updateOrderToDeliveredService(id as string);
    sendSuccessResponse(res, {
      message: "Order delivered successfully",
      data: order,
    });
  },
);

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Protected/Admin-Manager
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatusService(id as string, status);
    sendSuccessResponse(res, {
      message: `Order status updated to ${status} successfully`,
      data: order,
    });
  },
);
