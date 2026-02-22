import Product, { IProduct } from "../models/product.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new product
 */
export const createProductService = async (
  productData: Partial<IProduct>,
): Promise<IProduct> => {
  return factory.createOne(Product)(productData);
};

/**
 * Get all products with pagination and filter
 */
export const getAllProductsService = factory.getAll(Product, [
  "title",
  "description",
]);

/**
 * Get product by ID
 */
export const getProductByIdService = factory.getOne(Product);

/**
 * Update product by ID
 */
export const updateProductService = async (
  id: string,
  updateData: Partial<IProduct>,
): Promise<IProduct | null> => {
  return factory.updateOne(Product)(id, updateData);
};

/**
 * Delete product by ID
 */
export const deleteProductService = factory.deleteOne(Product);
