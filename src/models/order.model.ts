import mongoose, { Schema, Document, Types } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  cartItems: {
    product: Types.ObjectId;
    quantity: number;
    color: string;
    price: number;
  }[];
  shippingAddress: {
    details?: string;
    phone: string;
    city: string;
    postalCode?: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: OrderStatus;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    cartItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],
    shippingAddress: {
      details: String,
      phone: {
        type: String,
        required: [true, "Phone number is required for shipping"],
      },
      city: {
        type: String,
        required: [true, "City is required for shipping"],
      },
      postalCode: String,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.CASH,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
  },
  { timestamps: true },
);

orderSchema.plugin(toJSONPlugin);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
