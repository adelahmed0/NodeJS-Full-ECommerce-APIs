import express, { Router, Request, Response, NextFunction } from "express";
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
import multer from "multer";
import { ApiError } from "../utils/apiError.js";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import asyncHandler from "express-async-handler";

const router: Router = express.Router();

const multerStorage = multer.memoryStorage();

const multerFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only images are allowed", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadMixOfImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

const resizeProductImages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // image processing for imageCover
    if (req.files.imageCover) {
      const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`src/uploads/products/${imageCoverFileName}`);

      req.body.imageCover = imageCoverFileName;
    }

    // image processing for images
    if (req.files.images) {
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (img, index) => {
          const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
          await sharp(img.buffer)
            .resize(2000, 1333)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`src/uploads/products/${imageName}`);
          req.body.images.push(imageName);
        }),
      );
    }
    next();
  },
);

router
  .route("/")
  .get(getAllProductsValidator, getAllProducts)
  .post(
    uploadMixOfImages,
    createProductValidator,
    resizeProductImages,
    createProduct,
  );

router
  .route("/:id")
  .get(getProductValidator, getProductById)
  .put(
    uploadMixOfImages,
    updateProductValidator,
    resizeProductImages,
    updateProduct,
  )
  .delete(deleteProductValidator, deleteProduct);

export default router;
