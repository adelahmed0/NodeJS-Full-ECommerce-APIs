import mongoose, { Schema, Document, Types } from "mongoose";
import { toJSONPlugin, imageURLPlugin } from "../helpers/mongoosePlugins.js";

/**
 * IProduct interface defining the structure for Product documents
 */
export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  quantity: number;
  sold: number;
  price: number;
  priceAfterDiscount: number;
  colors: string[];
  imageCover: string;
  images: string[];
  category: Types.ObjectId;
  subcategories: Types.ObjectId[];
  brand: Types.ObjectId;
  ratingsAverage: number;
  ratingsQuantity: number;
}

/**
 * Product Schema definition with validations and relationships
 */
const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Too short product title"],
      maxlength: [100, "Too long product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [20, "Too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    // Number of items sold, updated during order processing
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      max: [200000, "Too long product price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],

    // Main product image (cover)
    imageCover: {
      type: String,
      required: [true, "Product Image cover is required"],
    },
    // Additional product images gallery
    images: [String],
    // Parent category reference
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a category"],
    },
    // Sub-categories references
    subcategories: [
      {
        type: Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    // Brand reference
    brand: {
      type: Types.ObjectId,
      ref: "Brand",
    },
    // Aggregated rating fields
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    // Auto-manage createdAt and updatedAt
    timestamps: true,
  },
);

/**
 * Apply custom plugins
 * toJSONPlugin: Cleaner JSON output
 * imageURLPlugin: Prepends storage URL to image paths
 */
productSchema.plugin(toJSONPlugin);
productSchema.plugin(imageURLPlugin, {
  folderName: "products",
  fields: ["imageCover", "images"],
});

/**
 * Virtual field for reviews
 * Allows fetching reviews associated with this product without storing IDs in the product document
 */
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

export default mongoose.model("Product", productSchema);
