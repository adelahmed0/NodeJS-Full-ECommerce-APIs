import Product, { IProduct } from "../models/product.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllProductsResponse } from "../types/product.types.js";
import ApiFeatures from "../utils/apiFeatures.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new product
 */
export const createProductService = async (
  productData: Partial<IProduct>,
): Promise<IProduct> => {
  if (productData.title) {
    productData.slug = slugify(productData.title, { lowercase: true });
  }
  const product = await Product.create(productData);
  return product;
};

/**
 * Get all products with pagination and filter
 */
export const getAllProductsService = async (
  queryString: any,
): Promise<IAllProductsResponse> => {
  // Build and execute query with all features in one chain
  const { mongooseQuery, paginationResult } = await new ApiFeatures(
    Product.find(),
    queryString,
  )
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(); // Automatically calculates count internally

  // Execute query with population
  const products = await mongooseQuery
    .populate("category", "name image")
    .populate("brand", "name image")
    .populate("subcategories", "name");

  // Return products with pagination metadata
  return {
    products,
    pagination: paginationResult!,
  };
};

/**
 * Get product by ID
 */
export const getProductByIdService = async (
  id: string,
): Promise<IProduct | null> => {
  const product = await Product.findById(id)
    .populate({ path: "category", select: "name image" })
    .populate({ path: "brand", select: "name image" })
    .populate({ path: "subcategories", select: "name" });
  return product;
};

/**
 * Update product by ID
 */
export const updateProductService = async (
  id: string,
  updateData: Partial<IProduct>,
): Promise<IProduct | null> => {
  if (updateData.title) {
    updateData.slug = slugify(updateData.title, { lowercase: true });
  }

  return factory.updateOne(Product, [
    { path: "category", select: "name image" },
    { path: "brand", select: "name image" },
    { path: "subcategories", select: "name" },
  ])(id, updateData);
};

/**
 * Delete product by ID
 */
export const deleteProductService = factory.deleteOne(Product);
