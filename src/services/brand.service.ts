import Brand, { IBrand } from "../models/brand.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllBrandsResponse } from "../types/brand.types.js";
import ApiFeatures from "../utils/apiFeatures.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new brand
 */
export const createBrandService = async (
  body: { name: string } & Partial<IBrand>,
): Promise<IBrand> => {
  if (body.name) {
    body.slug = slugify(body.name, { lowercase: true });
  }
  return factory.createOne(Brand)(body);
};

/**
 * Get all brands with pagination and filter
 */
export const getAllBrandsService = async (
  queryString: any,
): Promise<IAllBrandsResponse> => {
  // Build and execute query with all features
  const { mongooseQuery, paginationResult } = await new ApiFeatures(
    Brand.find(),
    queryString,
  )
    .filter()
    .search(["name"]) // Search in brand name
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const brands = await mongooseQuery;

  // Return brands with pagination metadata
  return {
    brands,
    pagination: paginationResult!,
  };
};

/**
 * Get brand by ID
 */
export const getBrandByIdService = async (
  id: string,
): Promise<IBrand | null> => {
  const brand = await Brand.findById(id);
  return brand;
};

/**
 * Update brand by ID
 */
export const updateBrandService = async (
  id: string,
  body: Partial<IBrand>,
): Promise<IBrand | null> => {
  if (body.name) {
    body.slug = slugify(body.name, { lowercase: true });
  }
  return factory.updateOne(Brand)(id, body);
};

/**
 * Delete brand by ID - Using Factory
 */
export const deleteBrandService = factory.deleteOne<IBrand>(Brand);
