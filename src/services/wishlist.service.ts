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
 * Check if product is in user wishlist
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
  const isInWishlist = user.wishlist.some((id) => id.equals(productObjectId));

  return isInWishlist;
};

/**
 * Get User Wishlist (with pagination)
 */
export const getWishlistService = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

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
      sort: { createdAt: -1 },
    },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Get total count for pagination
  const totalCount = await User.findById(userId).select("wishlist").lean();
  const total_count = totalCount?.wishlist.length || 0;

  return {
    wishlist: user.wishlist,
    total_count,
    current_page: page,
    last_page: Math.ceil(total_count / limit),
    per_page: limit,
  };
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
