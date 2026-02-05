import mongoose from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: [true, "Category name already exists"],
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

const Category = mongoose.model("Category", categorySchema);

export default Category;
