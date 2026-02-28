import Product, { IProduct } from "../models/product.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new product
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
 * Get all products with pagination and filter
 */
export const getAllProductsService = factory.getAll(
  Product,
  ["title", "description"],
  [
    { path: "category", select: "name image" },
    { path: "brand", select: "name image" },
    { path: "subcategories", select: "name" },
  ],
);

/**
 * Get product by ID
 */
export const getProductByIdService = factory.getOne(Product, [
  { path: "category", select: "name image" },
  { path: "brand", select: "name image" },
  { path: "subcategories", select: "name" },
]);

/**
 * Update product by ID
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
 * Delete product by ID
 */
export const deleteProductService = factory.deleteOne(Product, [
  { path: "category", select: "name image" },
  { path: "brand", select: "name image" },
  { path: "subcategories", select: "name" },
]);
