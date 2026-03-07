import Order, { IOrder } from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";
import * as factory from "./handlersFactory.service.js";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
/**
 * @desc    Create cash order
 * @param   userId
 * @param   shippingAddress
 * @returns Success Order
 */
export const createCashOrderService = async (
  userId: string,
  cartId: string,
  shippingAddress: any,
) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  //  1 Get cart depend on cartId
  const cart = await Cart.findById(cartId);
  if (!cart) {
    throw new ApiError(`There is no such cart with id ${cartId}`, 404);
  }
  //  2 Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  //  3 Create order with default paymentMethodCash
  const order = await Order.create({
    user: new Types.ObjectId(userId),
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice,
  });
  //  4 After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    //  5 Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);

    // Populate order before returning
    await order.populate([
      { path: "user", select: "name email phone" },
      {
        path: "cartItems.product",
        select: "title imageCover ratingsAverage price",
      },
    ]);
  }
  return order;
};

export const filterOrderForLoggedUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.type === "user") {
      req.filterObj = { user: req.user._id };
    }
    next();
  },
);
/**
 * @desc    Get all orders
 * @param   req
 * @param   res
 * @returns Success Order
 */
export const getAllOrdersService = factory.getAll<IOrder>(
  Order,
  ["shippingAddress.city", "totalOrderPrice"],
  [
    { path: "user", select: "name email phone" },
    {
      path: "cartItems.product",
      select: "title imageCover ratingsAverage price",
    },
  ],
);

/**
 * @desc    Get specific order
 * @param   id
 * @returns Success Order
 */
export const getSpecificOrderService = factory.getOne<IOrder>(Order, [
  { path: "user", select: "name email phone" },
  {
    path: "cartItems.product",
    select: "title imageCover ratingsAverage price",
  },
]);

/**
 * @desc    Update order to paid
 * @param   id
 * @returns Success Order
 */
export const updateOrderToPaidService = async (id: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(`There is no such order with id ${id}`, 404);
  }

  order.isPaid = true;
  order.paidAt = new Date(Date.now());

  const updatedOrder = await order.save();
  return updatedOrder;
};

/**
 * @desc    Update order to delivered
 * @param   id
 * @returns Success Order
 */
export const updateOrderToDeliveredService = async (id: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(`There is no such order with id ${id}`, 404);
  }

  order.isDelivered = true;
  order.deliveredAt = new Date(Date.now());
  order.status = "delivered";

  const updatedOrder = await order.save();
  return updatedOrder;
};
