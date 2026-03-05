import mongoose, { Schema, Document, Types } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

export interface ICoupon extends Document {
  name: string;
  expire: Date;
  discount: number;
}

const couponSchema = new Schema<ICoupon>(
  {
    name: {
      type: String,
      required: [true, "Coupon name is required"],
      trim: true,
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, "Coupon expire is required"],
    },
    discount: {
      type: Number,
      required: [true, "Coupon discount is required"],
    },
  },
  {
    timestamps: true,
  },
);

couponSchema.plugin(toJSONPlugin);

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);

export default Coupon;
