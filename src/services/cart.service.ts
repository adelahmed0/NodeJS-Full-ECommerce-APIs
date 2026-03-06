import { ApiError } from "../utils/apiError.js";
import Cart, { ICart } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import { Types } from "mongoose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Recalculate totalPrice from cart items and save the cart
 */
const calcTotalPrice = (cart: ICart): number => {
  const totalPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  cart.totalPrice = totalPrice;
  return totalPrice;
};

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Add product to cart (or increment quantity if already exists with same color)
 */
export const addProductToCartService = async (
  userId: string,
  productId: string,
  color: string,
  quantity: number = 1,
) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // 1 Get cart for logged user
  let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

  // 2 If no cart, create new cart
  if (!cart) {
    cart = await Cart.create({
      user: new Types.ObjectId(userId),
      cartItems: [
        {
          product: new Types.ObjectId(productId),
          color,
          quantity,
          price: product.price,
        },
      ],
    });
  } else {
    // product exists in cart update quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color,
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      cart.cartItems.push({
        product: new Types.ObjectId(productId),
        color,
        quantity,
        price: product.price,
      });
    }
  }

  calcTotalPrice(cart);

  await cart.save();

  return cart;
};

/**
 * Get logged user cart
 */

export const getLoggedUserCartService = async (userId: string) => {
  const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
  if (!cart) {
    throw new ApiError("Cart not found", 404);
  }
  return cart;
};

/**
 * Remove specific item from cart by itemId
 */
export const removeCartItemService = async (userId: string, itemId: string) => {
  const cart = await Cart.findOneAndUpdate(
    { user: new Types.ObjectId(userId) },
    { $pull: { cartItems: { _id: new Types.ObjectId(itemId) } } },
    { new: true },
  );

  if (!cart) {
    throw new ApiError("Cart not found", 404);
  }

  calcTotalPrice(cart);
  await cart.save();

  return cart;
};

/**
 * Update specific cart item quantity
 */
export const updateCartItemQuantityService = async (
  userId: string,
  itemId: string,
  quantity: number,
) => {
  const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });
  if (!cart) {
    throw new ApiError("Cart not found", 404);
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id?.toString() === itemId,
  );

  if (itemIndex === -1) {
    throw new ApiError("Cart item not found", 404);
  }

  // Check product stock
  const productId = cart.cartItems[itemIndex].product;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  if (quantity > product.quantity) {
    throw new ApiError(
      `Only ${product.quantity} items available in stock`,
      400,
    );
  }

  cart.cartItems[itemIndex].quantity = quantity;

  calcTotalPrice(cart);
  await cart.save();

  return cart;
};

/**
 * Clear logged user cart
 */
export const clearCartService = async (userId: string) => {
  await Cart.findOneAndDelete({ user: new Types.ObjectId(userId) });
};

/**
 * Apply coupon on cart
 */
export const applyCouponService = async (
  userId: string,
  couponName: string,
) => {
  // 1- Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: { $regex: new RegExp(`^${couponName}$`, "i") }, // case-insensitive
    expire: { $gt: new Date() },
  });

  if (!coupon) {
    throw new ApiError("Coupon is invalid or expired", 400);
  }

  // 2- Get logged user cart
  const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

  if (!cart) {
    throw new ApiError("Cart not found", 404);
  }

  const totalPrice = cart.totalPrice;

  // 3- Calculate price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = Number(totalPriceAfterDiscount);

  await cart.save();

  return cart;
};
