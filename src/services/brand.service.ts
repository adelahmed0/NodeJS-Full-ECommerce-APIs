import Brand, { IBrand } from "../models/brand.model.js";
import slugify from "@sindresorhus/slugify";
import { IAllBrandsResponse } from "../types/brand.types.js";
import ApiFeatures from "../utils/apiFeatures.js";
import * as factory from "./handlersFactory.service.js";

/**
 * Create a new brand
 */
export const createBrandService = async (
  body: { name: string } & Partial<IBrand>,
): Promise<IBrand> => {
  if (body.name) {
    body.slug = slugify(body.name, { lowercase: true });
  }
  return factory.createOne(Brand)(body);
};

/**
 * Get all brands with pagination and filter
 */
export const getAllBrandsService = factory.getAll(Brand, ["name"]);

/**
 * Get brand by ID
 */
export const getBrandByIdService = factory.getOne(Brand);

/**
 * Update brand by ID
 */
export const updateBrandService = async (
  id: string,
  body: Partial<IBrand>,
): Promise<IBrand | null> => {
  if (body.name) {
    body.slug = slugify(body.name, { lowercase: true });
  }
  return factory.updateOne(Brand)(id, body);
};

/**
 * Delete brand by ID - Using Factory
 */
export const deleteBrandService = factory.deleteOne<IBrand>(Brand);
