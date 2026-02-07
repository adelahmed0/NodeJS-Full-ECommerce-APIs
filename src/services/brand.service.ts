import Brand, { IBrand } from "../models/brand.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllBrandsResponse } from "../types/brand.types.js";

/**
 * Create a new brand
 */
export const createBrandService = async (
  name: string,
): Promise<IBrand> => {
  const slug = slugify(name, { lowercase: true });
  const brand = await Brand.create({ name, slug });
  return brand;
};

/**
 * Get all brands with pagination
 */
export const getAllBrandsService = async (
  page: number,
  per_page: number,
): Promise<IAllBrandsResponse> => {
  const skip = (page - 1) * per_page;
  const brands = await Brand.find().skip(skip).limit(per_page);
  const totalBrands = await Brand.countDocuments();
  const totalPages = Math.ceil(totalBrands / per_page);

  return {
    brands,
    pagination: {
      total_count: totalBrands,
      current_page: page,
      last_page: totalPages,
      per_page: per_page,
    },
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
  const brand = await Brand.findByIdAndUpdate(id, { name, slug }, { new: true });
  return brand;
};

/**
 * Delete brand by ID
 */

export const deleteBrandService = async (id: string): Promise<IBrand | null> => {
  const brand = await Brand.findByIdAndDelete(id);
  return brand;
};