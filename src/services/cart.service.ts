import { ApiError } from "../utils/apiError.js";
import Cart, { ICart } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ICoupon } from "../models/coupon.model.js";
import { Types } from "mongoose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Utility to recalculate the total price of the cart based on item quantities and prices.
 * Also handles discount calculation if a coupon is active.
 */
const calcTotalPrice = (cart: ICart): void => {
  // Sum up (price * quantity) for all items
  const totalPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  cart.totalPrice = totalPrice;

  // If a discount (percentage) exists, calculate the reduced total
  if (cart.discount && cart.discount > 0) {
    const totalPriceAfterDiscount = (
      totalPrice -
      (totalPrice * cart.discount) / 100
    ).toFixed(2);
    cart.totalPriceAfterDiscount = Number(totalPriceAfterDiscount);
  } else {
    // Clear discount field if none applies
    cart.totalPriceAfterDiscount = undefined;
  }
};

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Add a product to the cart.
 * Logic:
 * 1. Find the user's cart.
 * 2. If it doesn't exist, create one.
 * 3. Check inventory/stock availability.
 * 4. If product with same color exists, increment quantity.
 * 5. Otherwise, push a new item to the cartItems array.
 */
export const addProductToCartService = async (
  userId: string,
  productId: string,
  color: string,
  quantity: number = 1,
) => {
  const quantityNum = parseInt(quantity.toString(), 10) || 1;

  // Verify product existence and fetch current price/stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  // 1) Locate or initialize user's cart
  let cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

  if (!cart) {
    // Initial stock check for new cart
    if (quantityNum > product.quantity) {
      throw new ApiError(
        `Only ${product.quantity} items available in stock`,
        400,
      );
    }

    // Create new cart document
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
    // 2) Update existing cart
    // Use findIndex to locate product matching BOTH ID and COLOR
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color,
    );

    if (productIndex > -1) {
      // Product already in cart -> update quantity
      const cartItem = cart.cartItems[productIndex];

      // Stock validation
      if (cartItem.quantity + quantityNum > product.quantity) {
        throw new ApiError(
          `Only ${product.quantity} items available in stock`,
          400,
        );
      }

      cartItem.quantity += quantityNum;
      cartItem.price = product.price; // Update price to latest
      cart.cartItems[productIndex] = cartItem;
    } else {
      // New product variation -> push to array
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

  // Final totals calculation and persistence
  calcTotalPrice(cart);
  await cart.save();

  // Populate product info for a clean UI response
  return cart.populate("cartItems.product", "title imageCover");
};

/**
 * Fetch the user's cart and populate related product/user metadata
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
 * Remove a specific item from the cart subdocument array
 */
export const removeCartItemService = async (userId: string, itemId: string) => {
  const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

  if (!cart) {
    throw new ApiError("Cart not found", 404);
  }

  // Filter out the requested item
  cart.cartItems = cart.cartItems.filter(
    (item) => item._id?.toString() !== itemId,
  );

  // If cart is now empty, delete the whole document to save DB space
  if (cart.cartItems.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return { cartItems: [], totalPrice: 0 };
  }

  calcTotalPrice(cart);
  await cart.save();

  return cart.populate("cartItems.product", "title imageCover");
};

/**
 * Modify the quantity of an item already residing in the cart
 * Includes stock validation to ensure we don't oversell.
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

  // Cross-reference with latest product stock
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

  // Update quantity and recalculate
  cart.cartItems[itemIndex].quantity = quantity;

  calcTotalPrice(cart);
  await cart.save();

  return cart.populate("cartItems.product", "title imageCover");
};

/**
 * Delete the user's cart document entirely
 */
export const clearCartService = async (userId: string) => {
  await Cart.findOneAndDelete({ user: new Types.ObjectId(userId) });
};

/**
 * Apply a coupon to the user's cart
 * @param coupon - The coupon object (pre-validated by middleware)
 */
export const applyCouponService = async (userId: string, coupon: ICoupon) => {
  const cart = await Cart.findOne({ user: new Types.ObjectId(userId) });

  if (!cart) {
    throw new ApiError("Cart not found", 404);
  }

  // Save the discount percentage and trigger total recalculation
  cart.discount = coupon.discount;

  calcTotalPrice(cart);
  await cart.save();

  return cart.populate("cartItems.product", "title imageCover");
};
