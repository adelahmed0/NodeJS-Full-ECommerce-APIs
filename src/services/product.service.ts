import Product, { IProduct } from "../models/product.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllProductsResponse } from "../types/product.types.js";

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
  page: number,
  per_page: number,
  filter: any,
): Promise<IAllProductsResponse> => {
  // 1) Filteration
  const queryStringObj = { ...filter };
  const excludeFields = [
    "page",
    "per_page",
    "limit",
    "sort",
    "fields",
    "keyword",
  ];
  excludeFields.forEach((field) => delete queryStringObj[field]);

  // Apply filtration using [gte, gt, lte, lt]
  let queryStr = JSON.stringify(queryStringObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  const filterObj = JSON.parse(queryStr);
  console.log("filterObj", filterObj);

  const skip = (page - 1) * per_page;
  const [products, totalProducts] = await Promise.all([
    Product.find(filterObj)
      .populate("category", "name image")
      .populate("brand", "name image")
      .populate("subcategories", "name")
      .skip(skip)
      .limit(per_page),
    Product.countDocuments(filterObj),
  ]);
  const totalPages = Math.ceil(totalProducts / per_page);

  return {
    products,
    pagination: {
      total_count: totalProducts,
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
