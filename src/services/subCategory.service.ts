import SubCategory, { ISubCategory } from "../models/subCategory.model.js";
import slugify from "@sindresorhus/slugify";
import { Types } from "mongoose";
import { IAllSubCategoriesResponse } from "../types/subCategory.types.js";
import ApiFeatures from "../utils/apiFeatures.js";

/**
 * Create a new subCategory
 */
export const createSubCategoryService = async (
  name: string,
  category: Types.ObjectId,
): Promise<ISubCategory> => {
  const slug = slugify(name, { lowercase: true });
  const subCategory = await SubCategory.create({ name, slug, category });
  await subCategory.populate("category", "name slug");
  return subCategory;
};

/**
 * Get all subCategories with pagination and filter
 */
export const getAllSubCategoriesService = async (
  queryString: any,
): Promise<IAllSubCategoriesResponse> => {
  // Build and execute query with all features
  const { mongooseQuery, paginationResult } = await new ApiFeatures(
    SubCategory.find(),
    queryString,
  )
    .filter()
    .search(["name"]) // Search in subcategory name
    .sort()
    .limitFields()
    .paginate();

  // Execute query with population
  const subCategories = await mongooseQuery.populate("category", "name slug");

  // Return subcategories with pagination metadata
  return {
    subCategories,
    pagination: paginationResult!,
  };
};

/**
 * Get subcategory by ID
 */
export const getSubCategoryByIdService = async (
  id: string,
): Promise<ISubCategory | null> => {
  const subCategory = await SubCategory.findById(id).populate(
    "category",
    "name slug",
  );
  return subCategory;
};

/**
 * Update subCategory by ID
 */
export const updateSubCategoryService = async (
  id: string,
  name: string,
  category: Types.ObjectId,
): Promise<ISubCategory | null> => {
  const slug = slugify(name, { lowercase: true });
  const subCategory = await SubCategory.findByIdAndUpdate(
    id,
    { name, slug, category },
    { new: true },
  ).populate("category", "name slug");
  return subCategory;
};

/**
 * Delete subCategory by ID
 */

export const deleteSubCategoryService = async (
  id: string,
): Promise<ISubCategory | null> => {
  const subCategory = await SubCategory.findByIdAndDelete(id);
  return subCategory;
};
