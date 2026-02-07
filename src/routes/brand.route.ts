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

const router: Router = express.Router();

router.post("/", createBrandValidator, createBrand);
router.get("/", getAllBrandsValidator, getAllBrands);
router.get("/:id", getBrandByIdValidator, getBrandById);
router.put("/:id", updateBrandValidator, updateBrand);
router.delete("/:id", deleteBrandValidator, deleteBrand);

export default router;
