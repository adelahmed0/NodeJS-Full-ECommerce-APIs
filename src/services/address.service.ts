import { ApiError } from "../utils/apiError.js";
import User, { IUser } from "../models/user.model.js";
import { Types } from "mongoose";

/**
 * Add a new address to the user's address list
 * @param userId - ID of the user owning the address
 * @param addressData - Details of the new address
 */
export const addAddressService = async (
  userId: string,
  addressData: {
    alias: string;
    details: string;
    phone: string;
    city: string;
    postalCode: string;
  },
) => {
  // Generate a new unique ID for this address within the array
  const newAddress = {
    id: new Types.ObjectId(),
    ...addressData,
  };

  /**
   * Use $addToSet to add the address only if it's unique.
   * Note: In MongoDB arrays of subdocuments, $addToSet checks for exact structure match.
   */
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { addresses: newAddress } },
    { new: true, runValidators: true },
  ).select("+addresses");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Double check if the address was added (useful for subdocument uniqueness checks)
  const wasAdded = user.addresses.some((addr) => addr.id.equals(newAddress.id));

  if (!wasAdded) {
    throw new ApiError("Address already exists", 400);
  }

  return newAddress;
};

/**
 * Retrieve user addresses with pagination and manual filtering
 * @param userId - ID of the user
 * @param options - Filtering and pagination options
 */
export const getAddressesService = async (
  userId: string,
  options: {
    page?: number;
    limit?: number;
    city?: string;
    alias?: string;
  } = {},
) => {
  const { page = 1, limit = 10, city, alias } = options;

  // Fetch only the addresses field to optimize performance
  const user = await User.findById(userId).select("+addresses");
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  let addresses = user.addresses;

  // 1) Apply manual filters (since addresses are in an array subdocument)
  if (city) {
    addresses = addresses.filter((addr) =>
      addr.city.toLowerCase().includes(city.toLowerCase()),
    );
  }

  if (alias) {
    addresses = addresses.filter((addr) =>
      addr.alias.toLowerCase().includes(alias.toLowerCase()),
    );
  }

  // 2) Calculate pagination metadata manually for the filtered array
  const total_count = addresses.length;
  const last_page = Math.ceil(total_count / limit);
  const offset = (page - 1) * limit;
  const paginatedData = addresses.slice(offset, offset + limit);

  return {
    addresses: paginatedData,
    pagination: {
      total_count,
      current_page: page,
      last_page,
      per_page: limit,
    },
  };
};

/**
 * Update an existing address by its subdocument ID
 * @param userId - Owner ID
 * @param addressId - Subdocument ID
 * @param addressData - Fields to update
 */
export const updateAddressService = async (
  userId: string,
  addressId: string,
  addressData: {
    alias?: string;
    details?: string;
    phone?: string;
    city?: string;
    postalCode?: string;
  },
) => {
  const user = await User.findById(userId).select("+addresses");
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Find the index of the address to update
  const addressIndex = user.addresses.findIndex(
    (addr) => addr.id.toString() === addressId,
  );

  if (addressIndex === -1) {
    throw new ApiError("Address not found", 404);
  }

  // Merge updates into the subdocument
  Object.assign(user.addresses[addressIndex], addressData);

  // Persist changes
  await user.save();

  return user.addresses[addressIndex];
};

/**
 * Remove an address from the user's list
 * @param userId - Owner ID
 * @param addressId - Subdocument ID to remove
 */
export const deleteAddressService = async (
  userId: string,
  addressId: string,
) => {
  const addressObjectId = new Types.ObjectId(addressId);

  // Use $pull operator to remove the object matching the ID from the array
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { id: addressObjectId } } },
    { new: true, runValidators: true },
  ).select("+addresses");

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check if document was modified
  const wasRemoved = !user.addresses.some((addr) =>
    addr.id.equals(addressObjectId),
  );
  if (!wasRemoved) {
    throw new ApiError("Address not found", 404);
  }

  return [];
};

/**
 * Set an address as default by moving it to the front of the array
 * @param userId - Owner ID
 * @param addressId - Subdocument ID
 */
export const setDefaultAddressService = async (
  userId: string,
  addressId: string,
) => {
  const user = await User.findById(userId).select("+addresses");
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const addressIndex = user.addresses.findIndex(
    (addr) => addr.id.toString() === addressId,
  );

  if (addressIndex === -1) {
    throw new ApiError("Address not found", 404);
  }

  // Reorder array: extract default and put it at index 0
  const [defaultAddress] = user.addresses.splice(addressIndex, 1);
  user.addresses.unshift(defaultAddress);

  await user.save();

  return defaultAddress;
};
