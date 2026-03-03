import mongoose, { Schema, Document, Types, Model } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";
import Product from "./product.model.js";

export interface IReview extends Document {
  title: string;
  ratings: number;
  user: Types.ObjectId;
  product: Types.ObjectId;
}

export interface IReviewModel extends Model<IReview> {
  calcAverageRatingsAndQuantity(productId: Types.ObjectId): Promise<void>;
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

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId: Types.ObjectId,
) {
  const result = await this.aggregate([
    // stage 1 get all reviews for specific product
    {
      $match: { product: productId },
    },
    // stage 2 calculate average ratings and quantity
    {
      $group: {
        _id: productId,
        ratingsAverage: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].ratingsAverage,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await (this.constructor as IReviewModel).calcAverageRatingsAndQuantity(
    this.product,
  );
});

reviewSchema.post("deleteOne", async function () {
  const query = this.getQuery();
  await (this.constructor as IReviewModel).calcAverageRatingsAndQuantity(
    query.product,
  );
});

const Review = mongoose.model<IReview, IReviewModel>("Review", reviewSchema);

export default Review;
