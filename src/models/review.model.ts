import mongoose, { Schema, Document, Types } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

export interface IReview extends Document {
  title: string;
  ratings: number;
  user: Types.ObjectId;
  product: Types.ObjectId;
}

const reviewSchema = new Schema<IReview>(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
  },
  { timestamps: true },
);

reviewSchema.plugin(toJSONPlugin);

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
