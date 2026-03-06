import mongoose, { Schema, Document, Types } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

export interface ICartItem {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  color: string;
  price: number;
}

export interface ICart extends Document {
  cartItems: ICartItem[];
  totalPrice: number;
  totalPriceAfterDiscount?: number;
  user: Types.ObjectId;
}

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Types.ObjectId,
    ref: "Product",
    required: [true, "Product is required"],
  },
  quantity: {
    type: Number,
    default: 1,
  },
  color: {
    type: String,
    required: [true, "Color is required"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
});

cartItemSchema.plugin(toJSONPlugin);

const cartSchema = new Schema<ICart>(
  {
    cartItems: [cartItemSchema],
    totalPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.plugin(toJSONPlugin);

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
