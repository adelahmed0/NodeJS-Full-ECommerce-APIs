import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  createCashOrderService,
  getAllOrdersService,
  getSpecificOrderService,
  updateOrderToDeliveredService,
  updateOrderToPaidService,
  updateOrderStatusService,
  createStripeCheckoutSessionService,
  stripe,
  createCardOrderService,
} from "../services/order.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";
import * as factory from "./handlersFactory.controller.js";

/**
 * @desc    Webhook to handle asynchronous Stripe payment notifications.
 *          This endpoint is called by Stripe when a session is completed.
 * @route   POST /webhook
 * @access  Public (Secured via signature verification)
 */
export const webhookCheckout = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event;

    try {
      // Verify that the request actually came from Stripe
      event = stripe.webhooks.constructEvent(
        req.body, // Must be the raw body
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Process the event: If checkout is successful, create the order in our DB
    if (event.type === "checkout.session.completed") {
      await createCardOrderService(event.data.object);
    }

    res.status(200).json({ received: true });
  },
);

/**
 * @desc    Create a new cash-on-delivery order
 * @route   POST /api/orders/:cartId
 * @access  Protected/User
 */
export const createCashOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartId } = req.params;
    const { shippingAddress } = req.body;

    // Service handles: cart retrieval, total price calculation, stock update, and cart clearing
    const order = await createCashOrderService(
      req.user!._id.toString(),
      cartId as string,
      shippingAddress,
    );

    sendSuccessResponse(res, {
      message: "Order created successfully",
      data: order,
      statusCode: 201,
    });
  },
);

/**
 * @desc    Initialize a Stripe Checkout Session for card payments
 * @route   GET /api/orders/checkout-session/:cartId
 * @access  Protected/User
 */
export const checkoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { cartId } = req.params;
    const { shippingAddress } = req.body;

    // URLs for redirection after payment attempt
    const successUrl = `${req.protocol}://${req.get("host")}/orders`;
    const cancelUrl = `${req.protocol}://${req.get("host")}/cart`;

    // Service communicates with Stripe API to create the session
    const session = await createStripeCheckoutSessionService(
      req.user!.email!,
      cartId as string,
      shippingAddress,
      successUrl,
      cancelUrl,
    );

    sendSuccessResponse(res, {
      message: "Checkout session created successfully",
      data: session,
    });
  },
);

/**
 * @desc    Fetch all orders (Admins see all, Users see only theirs via filter)
 * @route   GET /api/orders
 * @access  Protected/User-Admin
 */
export const getAllOrders = factory.getAll(getAllOrdersService, "Orders");

/**
 * @desc    Fetch a specific order by ID
 * @route   GET /api/orders/:id
 * @access  Protected/User-Admin
 */
export const getSpecificOrder = factory.getOne(
  getSpecificOrderService,
  "Order",
);

/**
 * @desc    Update order payment status to 'Paid' manually (e.g., for Cash on Delivery)
 * @route   PUT /api/orders/:id/pay
 * @access  Protected/Admin-Manager
 */
export const updateOrderToPaid = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await updateOrderToPaidService(id as string);
    sendSuccessResponse(res, {
      message: "Order paid successfully",
      data: order,
    });
  },
);

/**
 * @desc    Update order shipping status to 'Delivered'
 * @route   PUT /api/orders/:id/deliver
 * @access  Protected/Admin-Manager
 */
export const updateOrderToDelivered = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await updateOrderToDeliveredService(id as string);
    sendSuccessResponse(res, {
      message: "Order delivered successfully",
      data: order,
    });
  },
);

/**
 * @desc    Generic status updater for an order (e.g., Canceled, Processing)
 * @route   PUT /api/orders/:id/status
 * @access  Protected/Admin-Manager
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = await updateOrderStatusService(id as string, status);
    sendSuccessResponse(res, {
      message: `Order status updated to ${status} successfully`,
      data: order,
    });
  },
);
