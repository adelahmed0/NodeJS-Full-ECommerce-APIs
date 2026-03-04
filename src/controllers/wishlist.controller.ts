import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  addProductToWishlistService,
  removeFromWishlistService,
  getWishlistService,
  clearWishlistService,
} from "../services/wishlist.service.js";
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

/**
 * @desc    Get user wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private/User
 */
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await getWishlistService(req.user!._id.toString());

  sendSuccessResponse(res, {
    message: "Wishlist retrieved successfully",
    data: wishlist,
  });
});

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private/User
 */
export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const wishlist = await removeFromWishlistService(
      req.user!._id.toString(),
      req.params.productId as string,
    );

    sendSuccessResponse(res, {
      message: "Product removed from wishlist successfully",
      data: wishlist,
    });
  },
);

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/v1/wishlist
 * @access  Private/User
 */
export const clearWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const wishlist = await clearWishlistService(req.user!._id.toString());

    sendSuccessResponse(res, {
      message: "Wishlist cleared successfully",
      data: wishlist,
    });
  },
);
