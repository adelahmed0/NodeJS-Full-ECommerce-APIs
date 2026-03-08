import multer from "multer";
import { ApiError } from "../utils/apiError.js";
import sharp from "sharp";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";

/**
 * Interface for documents that contain image fields
 */
interface DocumentWithImage {
  image?: string;
}

/**
 * Configure Multer storage and filters
 */
const multerOptions = () => {
  // Store files in memory as Buffers for processing with Sharp
  const multerStorage = multer.memoryStorage();

  // Only allow image mime types
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

/**
 * Middleware for uploading a single image
 */
export const uploadSingleImage = (fieldName: string) =>
  multerOptions().single(fieldName);

/**
 * Middleware for uploading multiple images across different fields
 */
export const uploadMixOfImages = (fields: multer.Field[]) =>
  multerOptions().fields(fields);

/**
 * Middleware to parse form-data without files
 */
export const parseFormData = () => multerOptions().none();

/**
 * Helper to delete old images from the filesystem when updating or deleting documents
 */
const deleteOldImage = async <T>(
  model: Model<T>,
  id: string,
  uploadPath: string,
  fieldName: string,
) => {
  // Use .lean() to get raw data and avoid automatic URL prepending from plugins
  const document = (await model.findById(id).lean()) as Record<
    string,
    unknown
  > | null;
  const fieldValue = document?.[fieldName];

  if (!fieldValue) return;

  const deleteFile = (fileName: string) => {
    // Extract base filename if it's a full URL
    const actualFileName = fileName.split("/").pop();
    if (!actualFileName) return;

    const filePath = path.join(uploadPath, actualFileName);
    // Sync delete if file exists
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  };

  // Handle both single strings and arrays of image names
  if (typeof fieldValue === "string") {
    deleteFile(fieldValue);
  } else if (Array.isArray(fieldValue)) {
    fieldValue.forEach((val) => {
      if (typeof val === "string") deleteFile(val);
    });
  }
};

/**
 * Middleware to resize and save a single uploaded image
 */
export const resizeImage = <T>(
  model: Model<T>,
  namePrefix: string,
  folderName: string,
  fieldName: string = "image",
  width: number = 600,
  height: number = 600,
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      const uploadPath = `src/uploads/${folderName}`;

      // Ensure target directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Cleanup: Delete old image if we are updating an existing document
      if (req.params.id) {
        await deleteOldImage(
          model,
          req.params.id as string,
          uploadPath,
          fieldName,
        );
      }

      // Generate unique filename and process with Sharp
      const fileName = `${namePrefix}-${uuidv4()}-${Date.now()}.jpeg`;
      await sharp(req.file.buffer)
        .resize(width, height)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`${uploadPath}/${fileName}`);

      // Save processed filename to body for the DB controller
      (req.body as Record<string, string>)[fieldName] = fileName;
    }
    next();
  });

export interface IFieldConfig {
  fieldName: string;
  width: number;
  height: number;
  namePrefix: string;
  isArray?: boolean;
  suffix?: string;
}

/**
 * Middleware to resize and save multiple images from mixed fields
 */
export const resizeMixedImages = <T>(
  model: Model<T>,
  folderName: string,
  fieldsConfigs: IFieldConfig[],
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as
      | { [fieldName: string]: Express.Multer.File[] }
      | undefined;

    if (!files) return next();

    const uploadPath = `src/uploads/${folderName}`;

    // Ensure target directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    await Promise.all(
      fieldsConfigs.map(async (config) => {
        const fieldFiles = files[config.fieldName];
        if (!fieldFiles || fieldFiles.length === 0) return;

        // Cleanup old images before saving new ones
        if (req.params.id) {
          await deleteOldImage(
            model,
            req.params.id as string,
            uploadPath,
            config.fieldName,
          );
        }

        // Process arrays of files (e.g., product images gallery)
        if (config.isArray) {
          req.body[config.fieldName] = [];
          await Promise.all(
            fieldFiles.map(async (file, index) => {
              const fileName = `${config.namePrefix}-${uuidv4()}-${Date.now()}-${index + 1}${
                config.suffix ? `-${config.suffix}` : ""
              }.jpeg`;
              await sharp(file.buffer)
                .resize(config.width, config.height)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(`${uploadPath}/${fileName}`);

              (req.body[config.fieldName] as string[]).push(fileName);
            }),
          );
        } else {
          // Process single file fields (e.g., brand logo)
          const fileName = `${config.namePrefix}-${uuidv4()}-${Date.now()}${
            config.suffix ? `-${config.suffix}` : ""
          }.jpeg`;
          await sharp(fieldFiles[0].buffer)
            .resize(config.width, config.height)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`${uploadPath}/${fileName}`);

          req.body[config.fieldName] = fileName;
        }
      }),
    );

    next();
  });

/**
 * Middleware to delete images associated with a document being deleted
 */
export const deleteImage = <T>(
  model: Model<T>,
  folderName: string,
  fieldName: string = "image",
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id) {
      const uploadPath = `src/uploads/${folderName}`;
      await deleteOldImage(
        model,
        req.params.id as string,
        uploadPath,
        fieldName,
      );
    }
    next();
  });
