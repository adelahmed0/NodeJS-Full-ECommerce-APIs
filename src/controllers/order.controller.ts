import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { createCashOrderService } from "../services/order.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

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
