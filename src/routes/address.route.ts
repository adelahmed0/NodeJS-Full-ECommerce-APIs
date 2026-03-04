import express, { Router } from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import {
  addAddressValidator,
  getAddressesValidator,
  updateAddressValidator,
  addressIdValidator,
} from "../validators/address.validator.js";
import multer from "multer";

// Create simple form-data parser for addresses (no files)
const parseAddressFormData = multer().none();

const router: Router = express.Router();

// All routes in this file require authentication and user role
router.use(protect);
router.use(allowedTo("user"));

/**
 * @desc    Add address
 * @route   POST /api/addresses
 * @access  Private/User
 */
router.post("/", parseAddressFormData, addAddressValidator, addAddress);

/**
 * @desc    Get user addresses
 * @route   GET /api/addresses
 * @access  Private/User
 */
router.get("/", getAddressesValidator, getAddresses);

/**
 * @desc    Update address
 * @route   PUT /api/addresses/:addressId
 * @access  Private/User
 */
router.put(
  "/:addressId",
  parseAddressFormData,
  updateAddressValidator,
  updateAddress,
);

/**
 * @desc    Delete address
 * @route   DELETE /api/addresses/:addressId
 * @access  Private/User
 */
router.delete("/:addressId", addressIdValidator, deleteAddress);

/**
 * @desc    Set default address
 * @route   PATCH /api/addresses/:addressId/default
 * @access  Private/User
 */
router.patch("/:addressId/default", addressIdValidator, setDefaultAddress);

export default router;
