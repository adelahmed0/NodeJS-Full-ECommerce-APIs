/**
 * Wishlist Controller
 * Manages user product wishlists, including adding, removing, and paginated listing of items.
 */
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  addProductToWishlistService,
  removeFromWishlistService,
  getWishlistService,
  clearWishlistService,
  checkProductInWishlistService,
} from "../services/wishlist.service.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";

/**
 * @desc    Add a product to the authenticated user's wishlist
 * @route   POST /api/v1/wishlist
 * @access  Private/User
 */
export const addProductToWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    // Service handles $addToSet to prevent duplicate entries
    const wishlist = await addProductToWishlistService(
      req.user!._id.toString(),
      req.body.productId,
    );

    sendSuccessResponse(res, {
      message: "Product added to wishlist successfully",
      data: wishlist,
      statusCode: 201, // HTTP 201 Created
    });
  },
);

/**
 * @desc    Retrieve the authenticated user's wishlist with full product details
 * @route   GET /api/v1/wishlist
 * @access  Private/User
 */
export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  // Extract pagination parameters with defaults
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Fetch populated data from service
  const result = await getWishlistService(
    req.user!._id.toString(),
    page,
    limit,
  );

  sendPaginatedResponse(res, {
    message: "Wishlist retrieved successfully",
    data: result.wishlist,
    pagination: {
      total_count: result.total_count,
      current_page: result.current_page,
      last_page: result.last_page,
      per_page: result.per_page,
    },
  });
});

/**
 * @desc    Remove a specific product from the wishlist
 * @route   DELETE /api/v1/wishlist/:productId
 * @access  Private/User
 */
export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    // Atomic removal of product ID via service
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
 * @desc    Check if a specific product exists in the user's wishlist
 * @route   GET /api/v1/wishlist/check/:productId
 * @access  Private/User
 */
export const checkProductInWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    // Check wishlist array in the database
    const isInWishlist = await checkProductInWishlistService(
      req.user!._id.toString(),
      req.params.productId as string,
    );

    sendSuccessResponse(res, {
      message: "Product wishlist status checked successfully",
      data: { isInWishlist },
    });
  },
);

/**
 * @desc    Empty the entire wishlist for the authenticated user
 * @route   DELETE /api/v1/wishlist
 * @access  Private/User
 */
export const clearWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    // Resets wishlist array to empty via service
    const wishlist = await clearWishlistService(req.user!._id.toString());

    sendSuccessResponse(res, {
      message: "Wishlist cleared successfully",
      data: wishlist,
    });
  },
);
