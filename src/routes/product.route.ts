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
    productUpload,
    createProductValidator,
    resizeProductImages,
    createProduct,
  );

router
  .route("/:id")
  .get(getProductValidator, getProductById)
  .put(
    productUpload,
    updateProductValidator,
    resizeProductImages,
    updateProduct,
  )
  .delete(deleteProductValidator, deleteProduct);

export default router;
