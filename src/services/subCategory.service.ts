import SubCategory, { ISubCategory } from "../models/subCategory.model.js";
import slugify from "@sindresorhus/slugify";
import { Types } from "mongoose";
import { IAllSubCategoriesResponse } from "../types/subCategory.types.js";

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
 * Get all subCategories with pagination
 */
export const getAllSubCategoriesService = async (
  page: number,
  per_page: number,
): Promise<IAllSubCategoriesResponse> => {
  const skip = (page - 1) * per_page;
  const subCategories = await SubCategory.find()
    .populate("category", "name slug")
    .skip(skip)
    .limit(per_page);

  const totalSubCategories = await SubCategory.countDocuments();
  const totalPages = Math.ceil(totalSubCategories / per_page);

  return {
    subCategories,
    pagination: {
      total_count: totalSubCategories,
      current_page: page,
      last_page: totalPages,
      per_page: per_page,
    },
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
