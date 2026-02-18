import { Model, UpdateQuery, PopulateOptions } from "mongoose";

/**
 * Factory function to delete a document by ID
 * @param Model - Mongoose model
 */
export const deleteOne = <T>(Model: Model<T>) => {
  return async (id: string) => {
    const document = await Model.findByIdAndDelete(id);
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
