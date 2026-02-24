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

const router: Router = express.Router();

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
  .get(getAllProductsValidator, getAllProducts)
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
  .get(getProductValidator, getProductById)
  .put(
    protect,
    allowedTo(UserRole.ADMIN),
    productUpload,
    updateProductValidator,
    resizeProductImages,
    updateProduct,
  )
  .delete(
    protect,
    allowedTo(UserRole.ADMIN),
    deleteProductValidator,
    deleteProduct,
  );

export default router;
