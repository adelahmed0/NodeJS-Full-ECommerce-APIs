import multer from "multer";
import { ApiError } from "../utils/apiError.js";
import sharp from "sharp";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";

interface DocumentWithImage {
  image?: string;
}

const multerOptions = () => {
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

  return upload;
};

export const uploadSingleImage = (fieldName: string) =>
  multerOptions().single(fieldName);

export const uploadMixOfImages = (arrayOfFields: multer.Field[]) =>
  multerOptions().fields(arrayOfFields);

export const resizeImage = <T extends DocumentWithImage>(
  model: Model<T>,
  namePrefix: string,
  folderName: string,
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      const uploadPath = `src/uploads/${folderName}`;

      // Ensure directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // If we are updating (id is present in params), delete the old image
      if (req.params.id) {
        const document = (await model.findById(req.params.id)) as T | null;
        if (document && document.image) {
          const oldImagePath = path.join(uploadPath, document.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const fileName = `${namePrefix}-${uuidv4()}-${Date.now()}.jpeg`;
      await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`${uploadPath}/${fileName}`);

      req.body.image = fileName;
    }
    next();
  });
