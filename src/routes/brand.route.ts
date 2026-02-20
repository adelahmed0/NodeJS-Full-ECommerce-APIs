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

const router: Router = express.Router();

router.post(
  "/",
  uploadSingleImage("image"),
  createBrandValidator,
  resizeImage<IBrand>(Brand, "brand", "brands", "image", 600, 600),
  createBrand,
);

router.get("/", getAllBrandsValidator, getAllBrands);
router.get("/:id", getBrandByIdValidator, getBrandById);

router.put(
  "/:id",
  uploadSingleImage("image"),
  updateBrandValidator,
  resizeImage<IBrand>(Brand, "brand", "brands", "image", 600, 600),
  updateBrand,
);

router.delete(
  "/:id",
  deleteBrandValidator,
  deleteImage(Brand, "brands"),
  deleteBrand,
);

export default router;
