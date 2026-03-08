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
 * Helper to handle shared post-order tasks like stock updates and cart cleanup.
 */
const handlePostOrderExecution = async (cart: any, cartId: string) => {
  // 1) Atomically decrement stock and increment 'sold' count
  const bulkOption = cart.cartItems.map((item: any) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
    },
  }));
  await Product.bulkWrite(bulkOption, {});

  // 2) Clean up: Delete the cart
  await Cart.findByIdAndDelete(cartId);
};

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

  // 1) Retrieve the cart and verify its existence and ownership
  const cart = await Cart.findOne({ _id: cartId, user: userId }).populate(
    "cartItems.product",
  );
  if (!cart) {
    throw new ApiError(
      `There is no such cart with id ${cartId} for this user`,
      404,
    );
  }

  // 2) Verify stock availability for all items before proceeding
  for (const item of cart.cartItems) {
    const product = item.product as any;
    if (product.quantity < item.quantity) {
      throw new ApiError(
        `Not enough stock for product: ${product.title}. Available: ${product.quantity}, Requested: ${item.quantity}`,
        400,
      );
    }
  }

  // 3) Prepare cart items with snapshots (title, image)
  const cartItemsSnapshots = cart.cartItems.map((item: any) => ({
    product: item.product._id,
    quantity: item.quantity,
    color: item.color,
    price: item.price,
    title: item.product.title,
    imageCover: item.product.imageCover,
  }));

  // 3) Determine the order price (prioritize discounted price if available)
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 4) Create the Order document (default payment method is 'cash')
  const order = await Order.create({
    user: new Types.ObjectId(userId),
    cartItems: cartItemsSnapshots,
    shippingAddress,
    totalOrderPrice,
    statusHistory: [{ status: OrderStatus.PENDING }],
  });

  if (order) {
    // 4) Execute post-order tasks (Stock update and Cart deletion)
    await handlePostOrderExecution(cart, cartId);

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
 * Mark an order as 'Paid', record the timestamp, and move to 'processing' status
 */
export const updateOrderToPaidService = async (id: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(`There is no such order with id ${id}`, 404);
  }

  order.isPaid = true;
  order.paidAt = new Date(Date.now());
  order.status = OrderStatus.PROCESSING;
  order.statusHistory?.push({
    status: OrderStatus.PROCESSING,
    timestamp: new Date(),
  });

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
  order.statusHistory?.push({
    status: OrderStatus.DELIVERED,
    timestamp: new Date(),
  });

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

  // Prevent updates to cancelled orders
  if (order.status === OrderStatus.CANCELLED) {
    throw new ApiError("Cannot update status of a cancelled order", 400);
  }

  // Auto-fill delivery fields if status becomes 'Delivered'
  if (status === OrderStatus.DELIVERED) {
    order.isDelivered = true;
    order.deliveredAt = new Date(Date.now());
  }

  order.status = status as OrderStatus;
  order.statusHistory?.push({
    status: status as OrderStatus,
    timestamp: new Date(),
  });

  const updatedOrder = await order.save();
  return updatedOrder;
};

/**
 * Cancel an order and restore product stock
 * @param id - Order ID
 */
export const cancelOrderService = async (id: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(`There is no such order with id ${id}`, 404);
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new ApiError("Order is already cancelled", 400);
  }

  if (order.status === OrderStatus.DELIVERED) {
    throw new ApiError("Cannot cancel a delivered order", 400);
  }

  // 1) Restore stock: Atomically increment quantity and decrement sold
  const bulkOption = order.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { quantity: +item.quantity, sold: -item.quantity } },
    },
  }));
  await Product.bulkWrite(bulkOption, {});

  // 2) Update order status
  order.status = OrderStatus.CANCELLED;
  order.statusHistory?.push({
    status: OrderStatus.CANCELLED,
    timestamp: new Date(),
  });

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

  // 1) Verify cart existence, ownership and stock availability
  const cart = await Cart.findOne({
    _id: cartId,
    user: (await User.findOne({ email: userEmail }))?._id,
  }).populate("cartItems.product");
  if (!cart) {
    throw new ApiError(
      `There is no such cart with id ${cartId} for this user`,
      404,
    );
  }

  // Check stock before creating session
  for (const item of cart.cartItems) {
    const product = item.product as any;
    if (product.quantity < item.quantity) {
      throw new ApiError(`Not enough stock for product: ${product.title}`, 400);
    }
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
  const sessionId = session.id;

  // 1) Idempotency Check: Prevent duplicate orders if Stripe sends webhook twice
  const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
  if (existingOrder) {
    console.info(
      `[Webhook Notice]: Order for session ${sessionId} already exists. Skipping.`,
    );
    return;
  }

  // 2) Find the transient cart and the user
  const cart = await Cart.findById(cartId).populate("cartItems.product");
  const user = await User.findOne({ email: session.customer_email });

  if (!cart || !user) {
    console.error(
      `[Stripe Webhook Error]: Cart (${cartId}) or User (${session.customer_email}) not found. Order creation skipped.`,
    );
    return;
  }

  // 3) Safety Check: Verify stock one last time before creating order (Rare race condition guard)
  for (const item of cart.cartItems) {
    const product = item.product as any;
    if (product.quantity < item.quantity) {
      console.error(
        `[Webhook Critical]: Stock ran out for ${product.title} before payment finalization.`,
      );
      // We should still create order since payment is done, but log critical inventory failure
    }
  }

  // 4) Persist the new order as 'Paid'
  const cartItemsSnapshots = cart.cartItems.map((item: any) => ({
    product: item.product._id,
    quantity: item.quantity,
    color: item.color,
    price: item.price,
    title: item.product.title,
    imageCover: item.product.imageCover,
  }));

  const order = await Order.create({
    user: user._id,
    cartItems: cartItemsSnapshots,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: new Date(),
    paymentMethod: "card",
    stripeSessionId: sessionId, // Store session ID to prevent duplicate creation
    status: OrderStatus.PROCESSING,
    statusHistory: [
      { status: OrderStatus.PENDING, timestamp: new Date() },
      { status: OrderStatus.PROCESSING, timestamp: new Date() },
    ],
  });

  // 3) Finalize stock updates and inventory cleanup
  if (order) {
    await handlePostOrderExecution(cart, cartId);
    console.info(
      `[Order Success]: Card order ${order._id} created via Stripe Webhook.`,
    );
  }
};
