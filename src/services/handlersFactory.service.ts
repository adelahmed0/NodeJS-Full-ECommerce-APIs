import { Model } from "mongoose";

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
