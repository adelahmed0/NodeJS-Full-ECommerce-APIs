import SubCategory, { ISubCategory } from "../models/subCategory.model.js";
import slugify from "@sindresorhus/slugify";
import { Types } from "mongoose";

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
