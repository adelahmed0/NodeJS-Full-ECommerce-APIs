import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  addProductToCartService,
  getLoggedUserCartService,
  removeCartItemService,
} from "../services/cart.service.js";

/**
 * @desc    Add product to cart
 * @route   POST /api/cart
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

    res.status(201).json({
      status: true,
      message: "Product added to cart successfully",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  },
);

/**
 * @desc    Get logged user cart
 * @route   GET /api/cart
 * @access  Private/User
 */
export const getLoggedUserCart = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await getLoggedUserCartService(req.user!._id.toString());

    res.status(200).json({
      status: true,
      message: "Cart fetched successfully",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  },
);

/**
 * @desc    Remove specific item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private/User
 */
export const removeCartItem = asyncHandler(
  async (req: Request, res: Response) => {
    const cart = await removeCartItemService(
      req.user!._id.toString(),
      req.params.itemId as string,
    );

    res.status(200).json({
      status: true,
      message: "Cart item removed successfully",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  },
);
