import { Model, UpdateQuery, PopulateOptions } from "mongoose";
import ApiFeatures from "../utils/apiFeatures.js";

/**
 * Services Factory: Reusable data access layer logic.
 * These functions produce standardized async functions for interacting with Mongoose models.
 */

/**
 * Factory function to create a new document
 * @param Model - Mongoose model to create in
 * @param populationOpts - Optional fields to populate in the returned document
 */
export const createOne = <T>(
  Model: Model<T>,
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (body: any) => {
    // 1) Create document in MongoDB
    const document = await Model.create(body);

    // 2) If population is needed, refetch with populated fields
    if (populationOpts) {
      const populatedDoc = await Model.findById(document._id).populate(
        populationOpts as any,
      );
      return populatedDoc!;
    }

    return document;
  };
};

/**
 * Factory function to delete a document by ID
 * @param Model - Mongoose model
 * @param populationOpts - Optional fields to populate in the returned document
 */
export const deleteOne = <T>(
  Model: Model<T>,
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (id: string) => {
    // 1) Find document first to check existence
    let query = Model.findById(id);
    if (populationOpts) {
      query = query.populate(populationOpts as any);
    }

    const document = await query;
    if (!document) {
      return null;
    }

    // 2) Delete via instance method to trigger 'deleteOne' middleware hooks
    await document.deleteOne();

    return document;
  };
};

/**
 * Factory function to update a document by ID
 * @param Model - Mongoose model
 * @param populationOpts - Optional fields to populate in the returned document
 */
export const updateOne = <T>(
  Model: Model<T>,
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (id: string, body: UpdateQuery<T>) => {
    // 1) Find document
    const document = await Model.findById(id);
    if (!document) {
      return null;
    }

    // 2) Update fields manually
    Object.assign(document, body);

    // 3) Save via instance method to trigger 'save' middleware hooks (like password hashing)
    await document.save();

    // 4) Optional population for the response
    if (populationOpts) {
      const populatedDoc = await Model.findById(document._id).populate(
        populationOpts as any,
      );
      return populatedDoc!;
    }

    return document;
  };
};

/**
 * Factory function to get a single document by ID
 * @param Model - Mongoose model
 * @param populationOpts - Fields to populate
 */
export const getOne = <T>(
  Model: Model<T>,
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (id: string, filterObj: any = {}) => {
    // Merge ID with optional filters (e.g., checking ownership)
    let query = Model.findOne({ _id: id, ...filterObj });

    if (populationOpts) {
      query = query.populate(populationOpts as any);
    }

    const document = await query;
    return document;
  };
};

/**
 * Factory function to fetch all documents with advanced query features
 * @param Model - Mongoose model
 * @param searchFields - Fields included in the text search feature
 * @param populationOpts - Fields to populate in the results
 */
export const getAll = <T>(
  Model: Model<T>,
  searchFields: string[] = ["name", "title"],
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (queryString: any, filterObj: any = {}) => {
    // 1) Initialize ApiFeatures with the base model query and the URL query string
    const apiFeatures = new ApiFeatures(Model.find(filterObj), queryString)
      .filter()
      .search(searchFields)
      .sort()
      .limitFields();

    // 2) Execute pagination (calculates skip/limit)
    await apiFeatures.paginate();

    // 3) Extract the final Mongoose query
    let query = apiFeatures.mongooseQuery;

    // 4) Apply population if requested
    if (populationOpts) {
      query = query.populate(populationOpts as any);
    }

    // 5) Execute the query
    const documents = await query;

    return {
      documents,
      pagination: apiFeatures.paginationResult!,
    };
  };
};
