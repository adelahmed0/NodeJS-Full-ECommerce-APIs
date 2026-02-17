import Product, { IProduct } from "../models/product.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllProductsResponse } from "../types/product.types.js";
import ApiFeatures from "../utils/apiFeatures.js";

/**
 * Create a new product
 */
export const createProductService = async (
  productData: Partial<IProduct>,
): Promise<IProduct> => {
  if (productData.title) {
    productData.slug = slugify(productData.title, { lowercase: true });
  }
  const product = await Product.create(productData);
  return product;
};

/**
 * Get all products with pagination and filter
 */
export const getAllProductsService = async (
  queryString: any,
): Promise<IAllProductsResponse> => {
  // 1) Initialize ApiFeatures without pagination first
  const apiFeatures = new ApiFeatures(Product.find(), queryString)
    .filter()
    .search();

  // 2) Get the count of filtered/searched documents
  // Using clone() because the query cannot be executed twice (Mongoose 6+)
  const totalFilteredProducts = await apiFeatures.mongooseQuery
    .clone()
    .countDocuments();

  // 3) Apply sorting, field limiting, and pagination
  apiFeatures.sort().limitFields().paginate(totalFilteredProducts);

  const products = await apiFeatures.mongooseQuery
    .populate("category", "name image")
    .populate("brand", "name image")
    .populate("subcategories", "name");

  // 4) Calculate pagination metadata
  const page = Math.max(1, parseInt(queryString.page) || 1);
  const per_page = Math.max(
    1,
    parseInt(queryString.limit || queryString.per_page) || 10,
  );
  const totalPages = Math.ceil(totalFilteredProducts / per_page);

  return {
    products,
    pagination: {
      total_count: totalFilteredProducts,
      current_page: page,
      last_page: totalPages,
      per_page: per_page,
    },
  };
};

/**
 * Get product by ID
 */
export const getProductByIdService = async (
  id: string,
): Promise<IProduct | null> => {
  const product = await Product.findById(id)
    .populate({ path: "category", select: "name image" })
    .populate({ path: "brand", select: "name image" })
    .populate({ path: "subcategories", select: "name" });
  return product;
};

/**
 * Update product by ID
 */
export const updateProductService = async (
  id: string,
  updateData: Partial<IProduct>,
): Promise<IProduct | null> => {
  if (updateData.title) {
    updateData.slug = slugify(updateData.title, { lowercase: true });
  }
  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate({ path: "category", select: "name image" })
    .populate({ path: "brand", select: "name image" })
    .populate({ path: "subcategories", select: "name" });

  return product;
};

/**
 * Delete product by ID
 */
export const deleteProductService = async (
  id: string,
): Promise<IProduct | null> => {
  const product = await Product.findByIdAndDelete(id);
  return product;
};
