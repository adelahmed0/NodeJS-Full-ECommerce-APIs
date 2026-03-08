/**
 * Brand Service
 * Encapsulates data access logic for Brands using the Standardized Handlers Factory.
 */
import Brand, { IBrand } from "../models/brand.model.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new brand document in the database
 * @param body - Partial brand data (name, image, etc.)
 */
export const createBrandService = async (
  body: Partial<IBrand>,
): Promise<IBrand> => {
  // Uses factory to handle standard creation logic
  return factory.createOne(Brand)(body);
};

/**
 * Fetch a list of all brands with advanced query features
 * Supports standard filtering, sorting, pagination, and searching on the 'name' field.
 */
export const getAllBrandsService = factory.getAll(Brand, ["name"]);

/**
 * Retrieve a specific brand document by its unique ID
 */
export const getBrandByIdService = factory.getOne(Brand);

/**
 * Update an existing brand's data by ID
 * @param id - Brand ID
 * @param body - Fields to update
 */
export const updateBrandService = async (
  id: string,
  body: Partial<IBrand>,
): Promise<IBrand | null> => {
  // Leverages factory for standardized update logic
  return factory.updateOne(Brand)(id, body);
};

/**
 * Permanently remove a brand from the database
 * Note: Uses deleteOne instance method internally to trigger middleware
 */
export const deleteBrandService = factory.deleteOne<IBrand>(Brand);
