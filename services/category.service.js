import Category from "../models/category.model.js";
import slugify from "slugify";


export const createCategoryService = async (name) => {
  const slug = slugify(name, { lower: true });
  const category = await Category.create({ name, slug });
  return category;
};


export const getAllCategoriesService = async () => {
  const categories = await Category.find();
  return categories;
};
