import Order, { IOrder, OrderStatus } from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";
import * as factory from "./handlersFactory.service.js";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

interface ShippingAddress {
  details?: string;
  phone: string;
  city: string;
  postalCode?: string;
}

/**
 * @desc    Create cash order
 * @param   userId
 * @param   shippingAddress
 * @returns Success Order
 */
export const createCashOrderService = async (
  userId: string,
  cartId: string,
  shippingAddress: ShippingAddress,
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
  order.status = OrderStatus.DELIVERED;

  const updatedOrder = await order.save();
  return updatedOrder;
};

/**
 * @desc    Update order status
 * @param   id
 * @param   status
 * @returns Success Order
 */
export const updateOrderStatusService = async (id: string, status: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(`There is no such order with id ${id}`, 404);
  }

  // If status is delivered, update isDelivered and deliveredAt
  if (status === OrderStatus.DELIVERED) {
    order.isDelivered = true;
    order.deliveredAt = new Date(Date.now());
  }

  // If status is paid, update isPaid and paidAt (optional, usually handled separately)
  // However, here we just update the status field primarily
  order.status = status as OrderStatus;

  const updatedOrder = await order.save();
  return updatedOrder;
};

// @desc    Create Stripe checkout session
// @route   GET /api/orders/checkout-session/:cartId
// @access  Protected/User
export const createStripeCheckoutSessionService = async (
  userEmail: string,
  cartId: string,
  shippingAddress: ShippingAddress,
  successUrl: string,
  cancelUrl: string,
) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1. Get cart
  const cart = await Cart.findById(cartId).populate("cartItems.product");
  if (!cart) {
    throw new ApiError(`There is no such cart with id ${cartId}`, 404);
  }

  // 2. Calculate total price
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3. Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: cart.cartItems.map((item: any) => ({
      price_data: {
        currency: "egp",
        product_data: {
          name: item.product.title,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    client_reference_id: cartId,
    metadata: shippingAddress as unknown as Stripe.MetadataParam,
  });
  return session;
};
