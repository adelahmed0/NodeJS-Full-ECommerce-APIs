import SubCategory, { ISubCategory } from "../models/subCategory.model.js";
import slugify from "@sindresorhus/slugify";
import { Types } from "mongoose";
import { IAllSubCategoriesResponse } from "../types/subCategory.types.js";
import ApiFeatures from "../utils/apiFeatures.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new subCategory
 */
export const createSubCategoryService = async (
  body: { name: string; category: Types.ObjectId } & Partial<ISubCategory>,
): Promise<ISubCategory> => {
  if (body.name) {
    body.slug = slugify(body.name, { lowercase: true });
  }
  const subCategory = await factory.createOne(SubCategory)(body);
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
export const getSubCategoryByIdService = factory.getOne(SubCategory, {
  path: "category",
  select: "name slug",
});

/**
 * Update subCategory by ID
 */
export const updateSubCategoryService = async (
  id: string,
  body: Partial<ISubCategory>,
): Promise<ISubCategory | null> => {
  if (body.name) {
    body.slug = slugify(body.name, { lowercase: true });
  }
  return factory.updateOne(SubCategory, "category")(id, body);
};

/**
 * Delete subCategory by ID
 */

export const deleteSubCategoryService = factory.deleteOne(SubCategory);
