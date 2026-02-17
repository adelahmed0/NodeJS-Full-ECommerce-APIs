import Brand, { IBrand } from "../models/brand.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllBrandsResponse } from "../types/brand.types.js";
import ApiFeatures from "../utils/apiFeatures.js";
/**
 * Create a new brand
 */
export const createBrandService = async (name: string): Promise<IBrand> => {
  const slug = slugify(name, { lowercase: true });
  const brand = await Brand.create({ name, slug });
  return brand;
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
  name: string,
): Promise<IBrand | null> => {
  const slug = slugify(name, { lowercase: true });
  const brand = await Brand.findByIdAndUpdate(
    id,
    { name, slug },
    { new: true },
  );
  return brand;
};

/**
 * Delete brand by ID
 */

export const deleteBrandService = async (
  id: string,
): Promise<IBrand | null> => {
  const brand = await Brand.findByIdAndDelete(id);
  return brand;
};
