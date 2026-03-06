import { ApiError } from "../utils/apiError.js";
import Cart, { ICart } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ICoupon } from "../models/coupon.model.js";
import { Types } from "mongoose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Recalculate totalPrice from cart items and save the cart
 */
const calcTotalPrice = (cart: ICart): void => {
  const totalPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  cart.totalPrice = totalPrice;
  // Reset coupon discount whenever cart totals are recalculated
  cart.totalPriceAfterDiscount = undefined;
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
      // Check stock before incrementing
      if (cartItem.quantity + quantity > product.quantity) {
        throw new ApiError(
          `Only ${product.quantity} items available in stock`,
          400,
        );
      }
      // #1: increment by the requested quantity (not always 1)
      cartItem.quantity += quantity;
      // #6: sync price in case it changed since item was added
      cartItem.price = product.price;
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
  const cart = await Cart.findOne({
    user: new Types.ObjectId(userId),
  })
    .populate("cartItems.product", "title imageCover price")
    .populate("user", "name email");
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

  // If cart is now empty, delete the document entirely
  if (cart.cartItems.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return null;
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
 * Apply coupon on cart — receives a pre-validated ICoupon object
 * (fetched & validated in the validator layer to avoid a second DB query)
 */
export const applyCouponService = async (userId: string, coupon: ICoupon) => {
  const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

  if (!cart) {
    throw new ApiError("Cart not found", 404);
  }

  const totalPrice = cart.totalPrice;

  // Calculate price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = Number(totalPriceAfterDiscount);

  await cart.save();

  return cart;
};
