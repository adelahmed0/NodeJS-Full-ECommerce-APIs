import mongoose, { Schema, Document } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

/**
 * Category Interface
 */
export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minLength: [3, "Category name must be at least 3 characters long"],
      maxLength: [32, "Category name must be at most 50 characters long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

categorySchema.plugin(toJSONPlugin);

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
