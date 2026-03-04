import { ApiError } from "../utils/apiError.js";
import User, { IUser } from "../models/user.model.js";
import { Types } from "mongoose";

/**
 * Add Product to Wishlist
 */
export const addProductToWishlistService = async (
  userId: string,
  productId: string,
) => {
  const productObjectId = new Types.ObjectId(productId);

  // Use $addToSet to add product to wishlist only if it doesn't exist
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productObjectId } },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check if the product was actually added (wasn't already in wishlist)
  const wasAdded = user.wishlist.some((id) => id.equals(productObjectId));
  if (!wasAdded) {
    throw new ApiError("Product already in wishlist", 400);
  }

  return user.wishlist;
};

/**
 * Remove Product from Wishlist
 */
export const removeFromWishlistService = async (
  userId: string,
  productId: string,
) => {
  const productObjectId = new Types.ObjectId(productId);

  // Use $pull to remove product from wishlist
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productObjectId } },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check if the product was actually removed (was in wishlist)
  const wasRemoved = !user.wishlist.some((id) => id.equals(productObjectId));
  if (!wasRemoved) {
    throw new ApiError("Product not found in wishlist", 400);
  }

  return user.wishlist;
};

/**
 * Get User Wishlist
 */
export const getWishlistService = async (userId: string) => {
  const user = await User.findById(userId).populate({
    path: "wishlist",
    select: "title description price imageCover ratingsAverage",
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return user.wishlist;
};

/**
 * Clear Wishlist
 */
export const clearWishlistService = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { wishlist: [] } },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return user.wishlist;
};
