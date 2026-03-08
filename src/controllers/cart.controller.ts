import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import {
  addProductToCartService,
  getLoggedUserCartService,
  removeCartItemService,
  clearCartService,
  updateCartItemQuantityService,
  applyCouponService,
} from "../services/cart.service.js";

/**
 * @desc    Add a product to the user's shopping cart
 * @route   POST /api/cart
 * @access  Private/User
 */
export const addProductToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, color, quantity } = req.body;

    // Call service to handle cart logic (find/create cart, handle duplicates, update price)
    const cart = await addProductToCartService(
      req.user!._id.toString(),
      productId,
      color,
      quantity,
    );

    res.status(201).json({
      status: true,
      message: "Product added to cart successfully",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  },
);

/**
 * @desc    Fetch the shopping cart for the currently logged-in user
 * @route   GET /api/cart
 * @access  Private/User
 */
export const getLoggedUserCart = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await getLoggedUserCartService(req.user!._id.toString());

    res.status(200).json({
      status: true,
      message: "Cart fetched successfully",
      // Handle null cart if user hasn't created one yet
      numOfCartItems: cart ? cart.cartItems.length : 0,
      data: cart || { cartItems: [], totalPrice: 0 },
    });
  },
);

/**
 * @desc    Remove a specific item from the cart by its ID
 * @route   DELETE /api/cart/:itemId
 * @access  Private/User
 */
export const removeCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await removeCartItemService(
      req.user!._id.toString(),
      req.params.itemId as string,
    );

    // If the last item was removed, the service might return an empty cart object
    if (cart.cartItems.length === 0) {
      res.status(200).json({
        status: true,
        message: "Cart item removed and cart is now empty",
        numOfCartItems: 0,
        data: cart,
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: "Cart item removed successfully",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  },
);

/**
 * @desc    Completely empty the user's shopping cart
 * @route   DELETE /api/cart
 * @access  Private/User
 */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await clearCartService(req.user!._id.toString());

  res.status(200).json({
    status: true,
    message: "Cart cleared successfully",
  });
});

/**
 * @desc    Update the quantity of a specific product already in the cart
 * @route   PUT /api/cart/:itemId
 * @access  Private/User
 */
export const updateCartItemQuantity = asyncHandler(
  async (req: Request, res: Response) => {
    const { quantity } = req.body;

    // Simple validation before calling service
    if (!quantity || quantity < 1) {
      throw new ApiError("Quantity must be greater than 0", 400);
    }

    const cart = await updateCartItemQuantityService(
      req.user!._id.toString(),
      req.params.itemId as string,
      Number(quantity),
    );

    res.status(200).json({
      status: true,
      message: "Cart item quantity updated successfully",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  },
);

/**
 * @desc    Apply a discount coupon to the current cart
 * @route   PUT /api/cart/applyCoupon
 * @access  Private/User
 */
export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  // Use the coupon object already fetched and validated in previous middleware/validator
  const cart = await applyCouponService(req.user!._id.toString(), req.coupon!);

  res.status(200).json({
    status: true,
    message: "Coupon applied successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
