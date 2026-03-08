import mongoose, { Schema, Document, Types, Model } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";
import Product from "./product.model.js";

/**
 * Review Interface for product feedback
 */
export interface IReview extends Document {
  title: string;
  ratings: number;
  user: Types.ObjectId;
  product: Types.ObjectId;
}

/**
 * Review Model extension for static methods
 */
export interface IReviewModel extends Model<IReview> {
  calcAverageRatingsAndQuantity(productId: Types.ObjectId): Promise<void>;
}

/**
 * Review Schema linked to User and Product
 */
const reviewSchema = new Schema<IReview>(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      required: [true, "Review ratings is required"],
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

/**
 * Static method to calculate average ratings and quantity for a product
 */
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId: Types.ObjectId,
) {
  const result = await this.aggregate([
    // stage 1: filter all reviews for specific product
    {
      $match: { product: productId },
    },
    // stage 2: group and calculate avg/sum
    {
      $group: {
        _id: productId,
        ratingsAverage: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  // Update Product document with new rating metadata
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].ratingsAverage,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    // Reset if no reviews left
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

/**
 * Re-calculate ratings after saving a review
 */
reviewSchema.post("save", async function () {
  await (this.constructor as IReviewModel).calcAverageRatingsAndQuantity(
    this.product,
  );
});

/**
 * Re-calculate ratings after deleting a review
 */
reviewSchema.post("deleteOne", async function () {
  const query = this.getQuery();
  await (this.constructor as IReviewModel).calcAverageRatingsAndQuantity(
    query.product,
  );
});

const Review = mongoose.model<IReview, IReviewModel>("Review", reviewSchema);

export default Review;
