import Category, { ICategory } from "../models/category.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllCategoriesResponse } from "../types/category.types.js";
import ApiFeatures from "../utils/apiFeatures.js";
import * as factory from "./handlersFactory.service.js";

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
  body: Partial<ICategory>,
): Promise<ICategory | null> => {
  if (body.name) {
    body.slug = slugify(body.name, { lowercase: true });
  }
  return factory.updateOne(Category)(id, body);
};

/**
 * Delete category by ID
 */

export const deleteCategoryService = factory.deleteOne(Category);
