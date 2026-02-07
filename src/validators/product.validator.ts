import { body, param, query } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";

export const createProductValidator = [
  body("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Too short product title")
    .isLength({ max: 100 })
    .withMessage("Too long product title"),
  body("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Too short product description"),
  body("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  body("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number"),
  body("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  body("colors")
    .optional()
    .isArray()
    .withMessage("colors should be array of string"),
  body("imageCover").notEmpty().withMessage("Product imageCover is required"),
  body("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  body("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID format")
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error(`No category for this id: ${categoryId}`);
      }
    }),
  body("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID format")
    .custom(async (subcategoriesIds) => {
      const subCategories = await SubCategory.find({
        _id: { $exists: true, $in: subcategoriesIds },
      });
      if (
        subCategories.length < 1 ||
        subCategories.length !== subcategoriesIds.length
      ) {
        throw new Error(`Invalid subcategories Ids`);
      }
    })
    .custom(async (val, { req }) => {
      const subCategories = await SubCategory.find({
        category: req.body.category,
      });
      const subCategoriesIdsInDB: string[] = [];
      subCategories.forEach((subCategory) => {
        subCategoriesIdsInDB.push(subCategory._id.toString());
      });
      // check if subcategories ids in body exists in db
      const checker = (target: string[], arr: string[]) =>
        target.every((v) => arr.includes(v));
      if (!checker(val, subCategoriesIdsInDB)) {
        throw new Error(`subcategories not belong to category`);
      }
    }),
  body("brand").optional().isMongoId().withMessage("Invalid ID format"),
  body("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),
  body("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  validatorMiddleware,
];

export const getProductValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];

export const updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  body("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short product title")
    .isLength({ max: 100 })
    .withMessage("Too long product title"),
  validatorMiddleware,
];

export const deleteProductValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];
