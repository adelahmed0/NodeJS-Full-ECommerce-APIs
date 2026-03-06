import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { addProductToCartService } from "../services/cart.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

/**
 * @desc    Add product to cart
 * @route   POST /api/v1/cart
 * @access  Private/User
 */
export const addProductToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, color, quantity } = req.body;

    const cart = await addProductToCartService(
      req.user!._id.toString(),
      productId,
      color,
      quantity,
    );

    sendSuccessResponse(res, {
      message: "Product added to cart successfully",
      data: cart,
      statusCode: 201,
    });
  },
);
