import Category from "../models/category.model.js";
import slugify from "slugify";

export const createCategoryService = async (name) => {
  const slug = slugify(name, { lower: true });
  const category = await Category.create({ name, slug });
  return category;
};

export const getAllCategoriesService = async (page, per_page) => {
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

export const getCategoryByIdService = async (id) => {
  const category = await Category.findById(id);
  return category;
};

