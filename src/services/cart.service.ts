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

  // Re-calculate discount if it exists in the cart object
  if (cart.discount && cart.discount > 0) {
    const totalPriceAfterDiscount = (
      totalPrice -
      (totalPrice * cart.discount) / 100
    ).toFixed(2);
    cart.totalPriceAfterDiscount = Number(totalPriceAfterDiscount);
  } else {
    cart.totalPriceAfterDiscount = undefined;
  }
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
  const quantityNum = parseInt(quantity.toString(), 10) || 1;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // 1 Get cart for logged user
  let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

  // 2 If no cart, create new cart
  if (!cart) {
    // #1 Check stock before create
    if (quantityNum > product.quantity) {
      throw new ApiError(
        `Only ${product.quantity} items available in stock`,
        400,
      );
    }
    cart = await Cart.create({
      user: new Types.ObjectId(userId),
      cartItems: [
        {
          product: new Types.ObjectId(productId),
          color,
          quantity: quantityNum,
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
      if (cartItem.quantity + quantityNum > product.quantity) {
        throw new ApiError(
          `Only ${product.quantity} items available in stock`,
          400,
        );
      }
      cartItem.quantity += quantityNum;
      cartItem.price = product.price; // Sync price
      cart.cartItems[productIndex] = cartItem;
    } else {
      // #1 Check stock before pushing new item
      if (quantityNum > product.quantity) {
        throw new ApiError(
          `Only ${product.quantity} items available in stock`,
          400,
        );
      }
      cart.cartItems.push({
        product: new Types.ObjectId(productId),
        color,
        quantity: quantityNum,
        price: product.price,
      });
    }
  }

  calcTotalPrice(cart);
  await cart.save();

  return cart.populate("cartItems.product", "title imageCover");
};

/**
 * Get logged user cart
 */

export const getLoggedUserCartService = async (userId: string) => {
  const cart = await Cart.findOne({
    user: new Types.ObjectId(userId),
  })
    .populate("cartItems.product", "title imageCover")
    .populate("user", "name email");

  return cart;
};

/**
 * Remove specific item from cart by itemId
 */
export const removeCartItemService = async (userId: string, itemId: string) => {
  const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

  if (!cart) {
    throw new ApiError("Cart not found", 404);
  }

  // #2 Filter item out of the array held in memory
  cart.cartItems = cart.cartItems.filter(
    (item) => item._id?.toString() !== itemId,
  );

  // If cart is now empty, delete the document entirely
  if (cart.cartItems.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return { cartItems: [], totalPrice: 0 };
  }

  calcTotalPrice(cart);
  await cart.save();

  return cart.populate("cartItems.product", "title imageCover");
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

  return cart.populate("cartItems.product", "title imageCover");
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

  // Store discount to be persisted across cart updates
  cart.discount = coupon.discount;

  calcTotalPrice(cart);
  await cart.save();

  return cart.populate("cartItems.product", "title imageCover");
};
