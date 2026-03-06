import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import { Types } from "mongoose";

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
  // 1) App settings (tax and shipping prices)
  const taxPrice = 0;
  const shippingPrice = 0;

  // 2) Get cart depend on cartId
  const cart = await Cart.findById(cartId);
  if (!cart) {
    throw new ApiError(`There is no such cart with id ${cartId}`, 404);
  }

  // Security check: ensure the cart belongs to the logged-in user
  if (cart.user.toString() !== userId) {
    throw new ApiError(
      "You are not authorized to place an order from this cart",
      403,
    );
  }

  // 3) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 4) Create order with default paymentMethodCash
  const order = await Order.create({
    user: new Types.ObjectId(userId),
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice,
  });

  // 5) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 6) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cart._id);
  }

  return order;
};
