import express, { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  getCategoryByIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  getAllCategoriesValidator,
} from "../validators/category.validator.js";
import subCategoryRouter from "./subCategory.route.js";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../utils/apiError.js";
import sharp from "sharp";
import asyncHandler from "express-async-handler";
import Category from "../models/category.model.js";
import fs from "fs";
import path from "path";

// const multerStorage = multer.diskStorage({
//   destination: "uploads/categories",
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, fileName);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only images are allowed", 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const resizeImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      // If we are updating (id is present in params), delete the old image
      if (req.params.id) {
        const category = await Category.findById(req.params.id);
        if (category && category.image) {
          const oldImagePath = path.join(
            "src/uploads/categories",
            category.image,
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;
      await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`src/uploads/categories/${fileName}`);
      req.body.image = fileName;
    }
    next();
  },
);

const router: Router = express.Router();

router.use("/:categoryId/sub-categories", subCategoryRouter);

router.post(
  "/",
  upload.single("image"),
  createCategoryValidator,
  resizeImage,
  createCategory,
);
router.get("/", getAllCategoriesValidator, getAllCategories);
router.get("/:id", getCategoryByIdValidator, getCategoryById);
router.put(
  "/:id",
  upload.single("image"),
  updateCategoryValidator,
  resizeImage,
  updateCategory,
);
router.delete("/:id", deleteCategoryValidator, deleteCategory);

export default router;
