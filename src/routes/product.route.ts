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

const router: Router = express.Router();

router
  .route("/")
  .get(getAllProductsValidator, getAllProducts)
  .post(createProductValidator, createProduct);

router
  .route("/:id")
  .get(getProductValidator, getProductById)
  .put(updateProductValidator, updateProduct)
  .delete(deleteProductValidator, deleteProduct);

export default router;
