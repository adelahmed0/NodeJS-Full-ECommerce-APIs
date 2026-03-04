import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  addAddressService,
  getAddressesService,
  updateAddressService,
  deleteAddressService,
  setDefaultAddressService,
} from "../services/address.service.js";
import { sendSuccessResponse } from "../utils/apiResponse.js";

/**
 * @desc    Add address
 * @route   POST /api/v1/addresses
 * @access  Private/User
 */
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const address = await addAddressService(req.user!._id.toString(), req.body);

  sendSuccessResponse(res, {
    message: "Address added successfully",
    data: address,
  });
});

/**
 * @desc    Get user addresses
 * @route   GET /api/v1/addresses
 * @access  Private/User
 */
export const getAddresses = asyncHandler(
  async (req: Request, res: Response) => {
    const addresses = await getAddressesService(req.user!._id.toString());

    sendSuccessResponse(res, {
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  },
);

/**
 * @desc    Update address
 * @route   PUT /api/v1/addresses/:addressId
 * @access  Private/User
 */
export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await updateAddressService(
      req.user!._id.toString(),
      req.params.addressId as string,
      req.body,
    );

    sendSuccessResponse(res, {
      message: "Address updated successfully",
      data: address,
    });
  },
);

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/addresses/:addressId
 * @access  Private/User
 */
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await deleteAddressService(
      req.user!._id.toString(),
      req.params.addressId as string,
    );

    sendSuccessResponse(res, {
      message: "Address deleted successfully",
      data: result,
    });
  },
);

/**
 * @desc    Set default address
 * @route   PATCH /api/v1/addresses/:addressId/default
 * @access  Private/User
 */
export const setDefaultAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await setDefaultAddressService(
      req.user!._id.toString(),
      req.params.addressId as string,
    );

    sendSuccessResponse(res, {
      message: "Default address set successfully",
      data: address,
    });
  },
);
