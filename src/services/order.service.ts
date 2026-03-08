import Order, { IOrder, OrderStatus } from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";
import * as factory from "./handlersFactory.service.js";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Stripe from "stripe";

// Initialize Stripe with the private secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

interface ShippingAddress {
  details?: string;
  phone: string;
  city: string;
  postalCode?: string;
}

/**
 * Handle the logic for creating an order with Cash on Delivery
 * @param userId - ID of the user placing the order
 * @param cartId - ID of the source shopping cart
 * @param shippingAddress - Destination address details
 */
export const createCashOrderService = async (
  userId: string,
  cartId: string,
  shippingAddress: ShippingAddress,
) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Retrieve the cart and verify its existence
  const cart = await Cart.findById(cartId);
  if (!cart) {
    throw new ApiError(`There is no such cart with id ${cartId}`, 404);
  }

  // 2) Determine the order price (prioritize discounted price if available)
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create the Order document (default payment method is 'cash')
  const order = await Order.create({
    user: new Types.ObjectId(userId),
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice,
  });

  if (order) {
    // 4) Atomically decrement stock and increment 'sold' count for all ordered items
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clean up: Delete the cart as it has been successfully converted to an order
    await Cart.findByIdAndDelete(cartId);

    // Re-populate the order for the API response
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

/**
 * Middleware to filter orders based on user role.
 * Regular users only see their own orders, while admins see all.
 */
export const filterOrderForLoggedUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.type === "user") {
      req.filterObj = { user: req.user._id };
    }
    next();
  },
);

/**
 * Service to fetch all orders with specific projections and population
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
 * Service to fetch a single order by its ID
 */
export const getSpecificOrderService = factory.getOne<IOrder>(Order, [
  { path: "user", select: "name email phone" },
  {
    path: "cartItems.product",
    select: "title imageCover ratingsAverage price",
  },
]);

/**
 * Mark an order as 'Paid' and record the timestamp
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
 * Mark an order as 'Delivered' and update its status
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
 * Manually update the lifecycle status of an order
 * @param id - Order ID
 * @param status - New status string from OrderStatus enum
 */
export const updateOrderStatusService = async (id: string, status: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(`There is no such order with id ${id}`, 404);
  }

  // Auto-fill delivery fields if status becomes 'Delivered'
  if (status === OrderStatus.DELIVERED) {
    order.isDelivered = true;
    order.deliveredAt = new Date(Date.now());
  }

  order.status = status as OrderStatus;

  const updatedOrder = await order.save();
  return updatedOrder;
};

/**
 * Setup a Stripe Checkout session to collect credit card info
 */
export const createStripeCheckoutSessionService = async (
  userEmail: string,
  cartId: string,
  shippingAddress: ShippingAddress,
  successUrl: string,
  cancelUrl: string,
) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Verify cart and source prices
  const cart = await Cart.findById(cartId).populate("cartItems.product");
  if (!cart) {
    throw new ApiError(`There is no such cart with id ${cartId}`, 404);
  }

  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 2) Construct Stripe session items from our cart subdocuments
  const session = await stripe.checkout.sessions.create({
    line_items: cart.cartItems.map((item: any) => ({
      price_data: {
        currency: "egp", // Egyptian Pound
        product_data: {
          name: item.product.title,
        },
        unit_amount: item.price * 100, // Stripe expects amounts in cents
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    client_reference_id: cartId, // Used by webhook to find the cart later
    metadata: shippingAddress as unknown as Stripe.MetadataParam,
  });
  return session;
};

/**
 * Create an order record after a successful Stripe payment
 * (Typically called by the webhook)
 * @param session - The completed Stripe checkout session object
 */
export const createCardOrderService = async (session: any) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  // 1) Find the transient cart and the user
  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  if (!cart || !user) {
    return; // Exit silently (webhook will retry or fail based on HTTP code)
  }

  // 2) Persist the new order as 'Paid' because credit card was processed
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: new Date(),
    paymentMethod: "card",
  });

  // 3) Finalize stock updates and inventory cleanup
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // Delete the cart
    await Cart.findByIdAndDelete(cartId);
  }
};
