/**
 * Brand Routes
 * Catalog of product manufacturers. Offers public viewing and
 * restricted Admin management with automated image resizing.
 */
import express, { Router } from "express";
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";
import {
  getBrandByIdValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
  getAllBrandsValidator,
} from "../validators/brand.validator.js";
import {
  uploadSingleImage,
  resizeImage,
  deleteImage,
} from "../middleware/uploadImage.middleware.js";
import Brand, { IBrand } from "../models/brand.model.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { UserRole } from "../models/user.model.js";

const router: Router = express.Router();

/**
 * @desc    Add a new brand to the catalog
 * @route   POST /api/brands
 * @access  Private/Admin
 */
router.post(
  "/",
  protect,
  allowedTo(UserRole.ADMIN),
  uploadSingleImage("image"),
  createBrandValidator,
  resizeImage<IBrand>(Brand, "brand", "brands", "image", 600, 600),
  createBrand,
);

/**
 * @desc    Get all brands with pagination/filtering
 * @route   GET /api/brands
 * @access  Public
 */
router.get("/", getAllBrandsValidator, getAllBrands);

/**
 * @desc    Fetch a single brand by MongoID
 * @route   GET /api/brands/:id
 * @access  Public
 */
router.get("/:id", getBrandByIdValidator, getBrandById);

/**
 * @desc    Update an existing brand's details
 * @route   PUT /api/brands/:id
 * @access  Private/Admin
 */
router.put(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  uploadSingleImage("image"),
  updateBrandValidator,
  resizeImage<IBrand>(Brand, "brand", "brands", "image", 600, 600),
  updateBrand,
);

/**
 * @desc    Permanently delete a brand
 * @route   DELETE /api/brands/:id
 * @access  Private/Admin
 */
router.delete(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  deleteBrandValidator,
  deleteImage(Brand, "brands"),
  deleteBrand,
);

export default router;
