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
    let query = Model.findByIdAndDelete(id);

    if (populationOpts) {
      query = query.populate(populationOpts as any);
    }

    const document = await query;
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
    let query = Model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (populationOpts) {
      query = query.populate(populationOpts as any);
    }

    const document = await query;
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
