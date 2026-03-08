import SubCategory, { ISubCategory } from "../models/subCategory.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new subCategory
 */
export const createSubCategoryService = async (
  body: Partial<ISubCategory>,
): Promise<ISubCategory> => {
  const subCategory = await factory.createOne(SubCategory)(body);
  await subCategory.populate("category", "name slug");
  return subCategory;
};

/**
 * Get all subCategories with pagination and filter
 */
export const getAllSubCategoriesService = factory.getAll(
  SubCategory,
  ["name"],
  { path: "category", select: "name slug" },
);

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
  return factory.updateOne(SubCategory, "category")(id, body);
};

/**
 * Delete subCategory by ID
 */
export const deleteSubCategoryService = factory.deleteOne(SubCategory);
