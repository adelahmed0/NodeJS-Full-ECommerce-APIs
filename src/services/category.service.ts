import Category, { ICategory } from "../models/category.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllCategoriesResponse } from "../types/category.types.js";
import ApiFeatures from "../utils/apiFeatures.js";

/**
 * Create a new category
 */
export const createCategoryService = async (
  name: string,
): Promise<ICategory> => {
  const slug = slugify(name, { lowercase: true });
  const category = await Category.create({ name, slug });
  return category;
};

/**
 * Get all categories with pagination and filter
 */
export const getAllCategoriesService = async (
  queryString: any,
): Promise<IAllCategoriesResponse> => {
  // Build and execute query with all features
  const { mongooseQuery, paginationResult } = await new ApiFeatures(
    Category.find(),
    queryString,
  )
    .filter()
    .search(["name"]) // Search in category name
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const categories = await mongooseQuery;

  // Return categories with pagination metadata
  return {
    categories,
    pagination: paginationResult!,
  };
};

/**
 * Get category by ID
 */
export const getCategoryByIdService = async (
  id: string,
): Promise<ICategory | null> => {
  const category = await Category.findById(id);
  return category;
};

/**
 * Update category by ID
 */
export const updateCategoryService = async (
  id: string,
  name: string,
): Promise<ICategory | null> => {
  const slug = slugify(name, { lowercase: true });
  const category = await Category.findByIdAndUpdate(
    id,
    { name, slug },
    { new: true },
  );
  return category;
};

/**
 * Delete category by ID
 */

export const deleteCategoryService = async (
  id: string,
): Promise<ICategory | null> => {
  const category = await Category.findByIdAndDelete(id);
  return category;
};
