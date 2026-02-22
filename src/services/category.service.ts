import Category, { ICategory } from "../models/category.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new category
 */
export const createCategoryService = async (
  body: Partial<ICategory>,
): Promise<ICategory> => {
  return factory.createOne(Category)(body);
};

/**
 * Get all categories with pagination and filter
 */
export const getAllCategoriesService = factory.getAll(Category, ["name"]);

/**
 * Get category by ID
 */
export const getCategoryByIdService = factory.getOne(Category);

/**
 * Update category by ID
 */
export const updateCategoryService = async (
  id: string,
  body: Partial<ICategory>,
): Promise<ICategory | null> => {
  return factory.updateOne(Category)(id, body);
};

/**
 * Delete category by ID
 */
export const deleteCategoryService = factory.deleteOne(Category);
