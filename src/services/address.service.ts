import { ApiError } from "../utils/apiError.js";
import User, { IUser } from "../models/user.model.js";
import { Types } from "mongoose";

/**
 * Add Address to User
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
  const newAddress = {
    id: new Types.ObjectId(),
    ...addressData,
  };

  // Use $addToSet to add address only if it doesn't exist
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { addresses: newAddress } },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check if the address was actually added (wasn't already in addresses)
  const wasAdded = user.addresses.some((addr) => addr.id.equals(newAddress.id));

  if (!wasAdded) {
    throw new ApiError("Address already exists", 400);
  }

  return newAddress;
};

/**
 * Get User Addresses
 */
export const getAddressesService = async (userId: string) => {
  const user = await User.findById(userId).select("addresses");
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  return user.addresses;
};

/**
 * Update Address
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
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const addressIndex = user.addresses.findIndex(
    (addr) => addr.id.toString() === addressId,
  );

  if (addressIndex === -1) {
    throw new ApiError("Address not found", 404);
  }

  // Update address fields
  Object.assign(user.addresses[addressIndex], addressData);
  await user.save();

  return user.addresses[addressIndex];
};

/**
 * Delete Address
 */
export const deleteAddressService = async (
  userId: string,
  addressId: string,
) => {
  const addressObjectId = new Types.ObjectId(addressId);

  // Use $pull to remove address from user addresses array
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { id: addressObjectId } } },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  // Check if address was actually removed
  const wasRemoved = !user.addresses.some((addr) =>
    addr.id.equals(addressObjectId),
  );
  if (!wasRemoved) {
    throw new ApiError("Address not found", 404);
  }

  return { message: "Address deleted successfully" };
};

/**
 * Set Default Address
 */
export const setDefaultAddressService = async (
  userId: string,
  addressId: string,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const addressIndex = user.addresses.findIndex(
    (addr) => addr.id.toString() === addressId,
  );

  if (addressIndex === -1) {
    throw new ApiError("Address not found", 404);
  }

  // Move the address to the beginning of the array (make it default)
  const [defaultAddress] = user.addresses.splice(addressIndex, 1);
  user.addresses.unshift(defaultAddress);
  await user.save();

  return defaultAddress;
};
