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

const multerStorage = multer.diskStorage({
  destination: "uploads/categories",
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});
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

const router: Router = express.Router();

router.use("/:categoryId/sub-categories", subCategoryRouter);

router.post(
  "/",
  upload.single("image"),
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req.file);
    next();
  },
  createCategoryValidator,
  createCategory,
);
router.get("/", getAllCategoriesValidator, getAllCategories);
router.get("/:id", getCategoryByIdValidator, getCategoryById);
router.put("/:id", updateCategoryValidator, updateCategory);
router.delete("/:id", deleteCategoryValidator, deleteCategory);

export default router;
