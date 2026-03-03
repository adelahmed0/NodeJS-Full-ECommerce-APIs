import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { addProductToWishlistService } from "../services/wishlist.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

/**
 * @desc    Add product to wishlist
 * @route   POST /api/v1/wishlist
 * @access  Private/User
 */
export const addProductToWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const wishlist = await addProductToWishlistService(
      req.user!._id.toString(),
      req.body.productId,
    );

    sendSuccessResponse(res, {
      message: "Product added to wishlist successfully",
      data: wishlist,
      statusCode: 201,
    });
  },
);
