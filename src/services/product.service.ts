import Product, { IProduct } from "../models/product.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Service to handle product creation
 * Includes automatic population of related category and brand info for the response.
 */
export const createProductService = async (
  productData: Partial<IProduct>,
): Promise<IProduct> => {
  return factory.createOne(Product, [
    { path: "category", select: "name image" },
    { path: "brand", select: "name image" },
    { path: "subcategories", select: "name" },
  ])(productData);
};

/**
 * Fetch a list of products with pagination, search (on title/description), and filtering.
 */
export const getAllProductsService = factory.getAll(
  Product,
  ["title", "description"],
  // Population is optionally disabled here to keep listing responses lightweight
  // [
  //   { path: "category", select: "name image" },
  //   { path: "brand", select: "name image" },
  //   { path: "subcategories", select: "name" },
  // ],
);

/**
 * Fetch detailed information for a single product.
 * Deeply populates category, brand, subcategories, and nested reviews with user info.
 */
export const getProductByIdService = factory.getOne(Product, [
  { path: "category", select: "name image" },
  { path: "brand", select: "name image" },
  { path: "subcategories", select: "name" },
  {
    path: "reviews",
    select: "title ratings",
    populate: [
      { path: "user", select: "name" },
      { path: "product", select: "title" },
    ],
  },
]);

/**
 * Update product details.
 * Re-validates and re-populates the returned document.
 */
export const updateProductService = async (
  id: string,
  updateData: Partial<IProduct>,
): Promise<IProduct | null> => {
  return factory.updateOne(Product, [
    { path: "category", select: "name image" },
    { path: "brand", select: "name image" },
    { path: "subcategories", select: "name" },
  ])(id, updateData);
};

/**
 * Remove a product from the database.
 * Returns the deleted document (populated) if needed for cleanup logic.
 */
export const deleteProductService = factory.deleteOne(Product);
