import { Model, UpdateQuery, PopulateOptions } from "mongoose";
import ApiFeatures from "../utils/apiFeatures.js";

/**
 * Factory function to create a new document
 * @param Model - Mongoose model
 * @param populationOpts - Optional population options
 */
export const createOne = <T>(
  Model: Model<T>,
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (body: any) => {
    const document = await Model.create(body);

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
 * @param populationOpts - Optional population options
 */
export const deleteOne = <T>(
  Model: Model<T>,
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (id: string) => {
    // Find the document first to trigger deleteOne hook
    const document = await Model.findById(id);
    if (!document) {
      return null;
    }

    // Delete the document to trigger the deleteOne hook
    await document.deleteOne();

    if (populationOpts) {
      // Return the populated document before deletion
      const populatedDoc = await Model.findById(document._id).populate(
        populationOpts as any,
      );
      return populatedDoc;
    }

    return document;
  };
};

/**
 * Factory function to update a document by ID
 * @param Model - Mongoose model
 * @param populationOpts - Optional population options
 */
export const updateOne = <T>(
  Model: Model<T>,
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (id: string, body: UpdateQuery<T>) => {
    // Find the document first
    const document = await Model.findById(id);
    if (!document) {
      return null;
    }

    // Update the document fields
    Object.assign(document, body);

    // Save to trigger post hooks
    await document.save();

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
 * Factory function to get a document by ID
 * @param Model - Mongoose model
 * @param populationOpts - Optional population options
 */
export const getOne = <T>(
  Model: Model<T>,
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (id: string) => {
    let query = Model.findById(id);

    if (populationOpts) {
      query = query.populate(populationOpts as any);
    }

    const document = await query;
    return document;
  };
};

/**
 * Factory function to get all documents
 * @param Model - Mongoose model
 * @param searchFields - Optional search fields
 * @param populationOpts - Optional population options
 */
export const getAll = <T>(
  Model: Model<T>,
  searchFields: string[] = ["name", "title"],
  populationOpts?: string | PopulateOptions | (string | PopulateOptions)[],
) => {
  return async (queryString: any, filterObj: any = {}) => {
    // Build query with all features
    const apiFeatures = new ApiFeatures(Model.find(filterObj), queryString)
      .filter()
      .search(searchFields)
      .sort()
      .limitFields();

    // Execute pagination separately to get total count
    await apiFeatures.paginate();

    let query = apiFeatures.mongooseQuery;

    if (populationOpts) {
      query = query.populate(populationOpts as any);
    }

    const documents = await query;

    return {
      documents,
      pagination: apiFeatures.paginationResult!,
    };
  };
};
