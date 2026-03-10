import { ApiError } from "../utils/apiError.js";
import User, { IUser } from "../models/user.model.js";
import { Types } from "mongoose";

/**
 * Add a product to the user's wishlist array.
 * Uses $addToSet to ensure uniqueness at the database level.
 */
export const addProductToWishlistService = async (
  userId: string,
  productId: string,
) => {
  const productObjectId = new Types.ObjectId(productId);

  // 1) Update the user document by pushing the product ID to the wishlist array
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productObjectId } },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 2) Verify if the item was already there (some drivers don't throw error on $addToSet duplicate)
  const wasAdded = user.wishlist.some((id) => id.equals(productObjectId));
  if (!wasAdded) {
    throw new ApiError("Product already in wishlist", 400);
  }

  return user.wishlist;
};

/**
 * Remove a specific product from the wishlist array.
 * Uses $pull to atomically remove the item.
 */
export const removeFromWishlistService = async (
  userId: string,
  productId: string,
) => {
  const productObjectId = new Types.ObjectId(productId);

  // 1) Update the user document by pulling the product ID
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productObjectId } },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 2) Verify removal (if it wasn't in list, $pull does nothing)
  const wasRemoved = !user.wishlist.some((id) => id.equals(productObjectId));
  if (!wasRemoved) {
    throw new ApiError("Product not found in wishlist", 400);
  }

  return user.wishlist;
};

/**
 * Check if a specific product currently exists in the user's wishlist.
 */
export const checkProductInWishlistService = async (
  userId: string,
  productId: string,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const productObjectId = new Types.ObjectId(productId);
  // Manual check against the array in memory
  const isInWishlist = user.wishlist.some((id) => id.equals(productObjectId));

  return isInWishlist;
};

/**
 * Fetch the user's wishlist with full product details and manual pagination.
 * This function handles population and offset calculations since wishlist is a sub-array.
 */
export const getWishlistService = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  // 1) Retrieve user and populate the wishlist array with relevant product fields
  const user = await User.findById(userId).populate({
    path: "wishlist",
    select:
      "title description price priceAfterDiscount imageCover images colors ratingsAverage ratingsQuantity category brand slug",
    populate: [
      {
        path: "category",
        select: "name slug",
      },
      {
        path: "brand",
        select: "name slug",
      },
    ],
    options: {
      skip,
      limit,
      sort: { createdAt: -1 }, // Sort by most recent additions
    },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // 2) Get total count of wishlist items for pagination metadata
  // We use lean() and select only 'wishlist' to keep the query performance-friendly
  const totalCountResult = await User.findById(userId)
    .select("wishlist")
    .lean();
  const total_count = totalCountResult?.wishlist.length || 0;

  return {
    wishlist: user.wishlist,
    total_count,
    current_page: page,
    last_page: Math.ceil(total_count / limit),
    per_page: limit,
  };
};

/**
 * Empty the user's wishlist entirely.
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
