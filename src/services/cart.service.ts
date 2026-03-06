import { ApiError } from "../utils/apiError.js";
import Cart, { ICart } from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { Types } from "mongoose";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Recalculate totalPrice from cart items and save the cart
 */
const calcTotalPrice = (cart: ICart): number => {
  return cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
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
      totalPrice: product.price * quantity,
    });
  } else {
    console.log("Cart already exists");
  }
};
