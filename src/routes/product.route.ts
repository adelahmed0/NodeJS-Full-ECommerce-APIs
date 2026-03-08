/**
 * Product Routes
 * Core catalog management. Supports nested Review routing, public
 * search/viewing, and Admin-only CRUD with multi-image processing.
 */
import express, { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
  getAllProductsValidator,
} from "../validators/product.validator.js";
import {
  uploadMixOfImages,
  resizeMixedImages,
} from "../middleware/uploadImage.middleware.js";
import Product from "../models/product.model.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";
import { UserRole } from "../models/user.model.js";
import reviewRouter from "./review.route.js";

const router: Router = express.Router();

/**
 * @desc    Nested routing for reviews belonging to a product
 */
router.use("/:productId/reviews", reviewRouter);

const productUpload = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

const resizeProductImages = resizeMixedImages(Product, "products", [
  {
    fieldName: "imageCover",
    width: 2000,
    height: 1333,
    namePrefix: "product",
    suffix: "cover",
  },
  {
    fieldName: "images",
    width: 2000,
    height: 1333,
    namePrefix: "product",
    isArray: true,
  },
]);

router
  .route("/")
  /**
   * @desc    Search and list all products with filtering/sorting
   * @route   GET /api/products
   * @access  Public
   */
  .get(getAllProductsValidator, getAllProducts)
  /**
   * @desc    Add a new product with multiple image uploads
   * @route   POST /api/products
   * @access  Private/Admin
   */
  .post(
    protect,
    allowedTo(UserRole.ADMIN),
    productUpload,
    createProductValidator,
    resizeProductImages,
    createProduct,
  );

router
  .route("/:id")
  /**
   * @desc    Get detailed specifications for one product
   * @route   GET /api/products/:id
   * @access  Public
   */
  .get(getProductValidator, getProductById)
  /**
   * @desc    Update product catalog data
   * @route   PUT /api/products/:id
   * @access  Private/Admin
   */
  .put(
    protect,
    allowedTo(UserRole.ADMIN),
    productUpload,
    updateProductValidator,
    resizeProductImages,
    updateProduct,
  )
  /**
   * @desc    Remove a product from the database
   * @route   DELETE /api/products/:id
   * @access  Private/Admin
   */
  .delete(
    protect,
    allowedTo(UserRole.ADMIN),
    deleteProductValidator,
    deleteProduct,
  );

export default router;
