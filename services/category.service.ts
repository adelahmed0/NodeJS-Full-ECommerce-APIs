import Category, { ICategory } from "../models/category.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllCategoriesResponse } from "../types/category.types.js";

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
 * Get all categories with pagination
 */
export const getAllCategoriesService = async (
  page: number,
  per_page: number,
): Promise<IAllCategoriesResponse> => {
  const skip = (page - 1) * per_page;
  const categories = await Category.find().skip(skip).limit(per_page);
  const totalCategories = await Category.countDocuments();
  const totalPages = Math.ceil(totalCategories / per_page);

  return {
    categories,
    pagination: {
      total_count: totalCategories,
      current_page: page,
      last_page: totalPages,
      per_page: per_page,
    },
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
