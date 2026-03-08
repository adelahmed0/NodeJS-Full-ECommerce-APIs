/**
 * Category Service
 * Centralized data management for Product Categories via factory handles.
 */
import Category, { ICategory } from "../models/category.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new category record
 * @param body - Partial category data (title, slug, image)
 */
export const createCategoryService = async (
  body: Partial<ICategory>,
): Promise<ICategory> => {
  // Uses factory to handle Mongoose persistence
  return factory.createOne(Category)(body);
};

/**
 * Retrieve a list of categories based on filters and pagination
 * Default text search is applied to the 'name' field.
 */
export const getAllCategoriesService = factory.getAll(Category, ["name"]);

/**
 * Find a specific category document using its ID
 */
export const getCategoryByIdService = factory.getOne(Category);

/**
 * Update an existing category document by ID
 * @param id - Document ID
 * @param body - Update payload
 */
export const updateCategoryService = async (
  id: string,
  body: Partial<ICategory>,
): Promise<ICategory | null> => {
  // Uses factory update method to ensure consistency
  return factory.updateOne(Category)(id, body);
};

/**
 * Delete a category by its unique ID
 */
export const deleteCategoryService = factory.deleteOne(Category);
