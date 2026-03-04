import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  addAddressService,
  getAddressesService,
  updateAddressService,
  deleteAddressService,
  setDefaultAddressService,
} from "../services/address.service.js";
import {
  sendSuccessResponse,
  sendPaginatedResponse,
} from "../utils/apiResponse.js";

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const city = req.query.city as string;
    const alias = req.query.alias as string;

    const result = await getAddressesService(req.user!._id.toString(), {
      page,
      limit,
      city,
      alias,
    });

    sendPaginatedResponse(res, {
      message: "Addresses retrieved successfully",
      data: result.addresses,
      pagination: result.pagination,
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
