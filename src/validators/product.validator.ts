import { body, param, query, Meta } from "express-validator";
import validatorMiddleware from "../middleware/validator.middleware.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Product from "../models/product.model.js";

const validateSubcategories = async (
  subCategoriesIds: any[],
  { req }: Meta,
) => {
  if (!Array.isArray(subCategoriesIds) || subCategoriesIds.length === 0) {
    return true;
  }

  try {
    const uniqueIds = [
      ...new Set(subCategoriesIds.map((id: any) => id.toString())),
    ];
    const subCategories = await SubCategory.find({
      _id: { $in: uniqueIds },
    });

    // 1. Check for missing subcategories
    if (subCategories.length !== uniqueIds.length) {
      const foundIds = subCategories.map((sub) => sub._id.toString());
      const missingIds = uniqueIds.filter((id) => !foundIds.includes(id));
      return Promise.reject(
        `These subcategory IDs were not found: [${missingIds.join(", ")}]`,
      );
    }

    // 2. Determine base Category ID to compare with
    let categoryId = req.body.category;
    if (!categoryId && req.params?.id) {
      const product = await Product.findById(req.params!.id);
      if (product) {
        categoryId = product.category.toString();
      }
    }

    // 3. Check membership
    if (categoryId) {
      const invalidSubCategories = subCategories
        .filter((sub) => sub.category.toString() !== categoryId)
        .map((sub) => sub._id);

      if (invalidSubCategories.length > 0) {
        return Promise.reject(
          `These subcategories: [${invalidSubCategories.join(", ")}] do not belong to the selected category`,
        );
      }
    }
  } catch (error) {
    return Promise.reject("Invalid database query or missing data");
  }

  return true;
};

export const createProductValidator = [
  body("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Product title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Product title must be at most 100 characters"),
  body("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Product description must be at least 20 characters"),
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
    .isFloat({ max: 200000 })
    .withMessage("Product price is too high"),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .isFloat({ min: 1 })
    .withMessage("Discounted price must be at least 1")
    .custom((value, { req }) => {
      if (req.body.price && value >= req.body.price) {
        return Promise.reject("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  body("colors")
    .optional()
    .isArray()
    .withMessage("colors should be an array of strings"),
  body("colors.*")
    .optional()
    .isString()
    .withMessage("each color must be a string"),
  body("imageCover").notEmpty().withMessage("Product imageCover is required"),
  body("images")
    .optional()
    .isArray()
    .withMessage("images should be an array of strings"),
  body("images.*")
    .optional()
    .isURL()
    .withMessage("each image must be a valid URL"),
  body("category")
    .notEmpty()
    .withMessage("Product category is required")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .custom(async (val) => {
      const category = await Category.findById(val);
      if (!category) {
        return Promise.reject(`Category not found with id: ${val}`);
      }
      return true;
    }),
  body("subcategories")
    .optional()
    .isArray()
    .withMessage("subcategories should be an array")
    .custom(validateSubcategories),
  body("brand").optional().isMongoId().withMessage("Invalid brand ID format"),
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

export const getAllProductsValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page number"),
  query("per_page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid per_page number"),
  validatorMiddleware,
];

export const getProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];

export const updateProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
  body("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Product title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Product title must be at most 100 characters"),
  body("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Product description must be at least 20 characters"),
  body("quantity")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  body("price")
    .optional()
    .isNumeric()
    .withMessage("Product price must be a number")
    .isFloat({ max: 200000 })
    .withMessage("Product price is too high"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format")
    .custom(async (val) => {
      const category = await Category.findById(val);
      if (!category) {
        return Promise.reject(`Category not found with id: ${val}`);
      }
      return true;
    }),
  body("subcategories")
    .optional()
    .isArray()
    .withMessage("subcategories should be an array")
    .custom(validateSubcategories),
  body("brand").optional().isMongoId().withMessage("Invalid brand ID format"),
  validatorMiddleware,
];

export const deleteProductValidator = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];
