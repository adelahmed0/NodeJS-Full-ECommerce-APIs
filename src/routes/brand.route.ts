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

router.post(
  "/",
  protect,
  allowedTo(UserRole.ADMIN),
  uploadSingleImage("image"),
  createBrandValidator,
  resizeImage<IBrand>(Brand, "brand", "brands", "image", 600, 600),
  createBrand,
);

router.get("/", getAllBrandsValidator, getAllBrands);
router.get("/:id", getBrandByIdValidator, getBrandById);

router.put(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  uploadSingleImage("image"),
  updateBrandValidator,
  resizeImage<IBrand>(Brand, "brand", "brands", "image", 600, 600),
  updateBrand,
);

router.delete(
  "/:id",
  protect,
  allowedTo(UserRole.ADMIN),
  deleteBrandValidator,
  deleteImage(Brand, "brands"),
  deleteBrand,
);

export default router;
