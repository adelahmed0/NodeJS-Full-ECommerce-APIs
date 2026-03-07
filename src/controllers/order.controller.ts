import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  createCashOrderService,
  getAllOrdersService,
  getSpecificOrderService,
  updateOrderToDeliveredService,
  updateOrderToPaidService,
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
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Protected/User-Admin
 */
export const getAllOrders = factory.getAll(getAllOrdersService, "Order");

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
