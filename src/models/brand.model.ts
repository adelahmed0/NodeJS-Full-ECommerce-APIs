import mongoose, { Schema, Document } from "mongoose";
import { toJSONPlugin, imageURLPlugin } from "../helpers/mongoosePlugins.js";

/**
 * Brand Interface representing the brand structure
 */
export interface IBrand extends Document {
  name: string;
  slug: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Brand Schema with validation and plugins
 */
const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      unique: true,
      minLength: [3, "Brand name must be at least 3 characters long"],
      maxLength: [100, "Brand name must be at most 100 characters long"],
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

// Apply plugins for cleaner JSON and image URL management
brandSchema.plugin(toJSONPlugin);
brandSchema.plugin(imageURLPlugin, {
  folderName: "brands",
  fields: ["image"],
});

const Brand = mongoose.model<IBrand>("Brand", brandSchema);

export default Brand;
