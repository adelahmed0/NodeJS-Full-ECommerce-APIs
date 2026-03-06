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
  //  5 Clear cart depend on cartId
};
