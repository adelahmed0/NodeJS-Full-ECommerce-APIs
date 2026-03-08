import mongoose, { Schema, Document, Types } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

/**
 * Order Status options
 */
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

/**
 * Supported payment methods
 */
export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
}

/**
 * IOrder Interface for completed transactions
 */
export interface IOrder extends Document {
  user: Types.ObjectId;
  cartItems: {
    product: Types.ObjectId;
    quantity: number;
    color: string;
    price: number;
    title: string;
    imageCover: string;
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
  statusHistory?: {
    status: OrderStatus;
    timestamp: Date;
  }[];
  stripeSessionId?: string;
}

/**
 * Order Schema definition
 */
const orderSchema = new Schema<IOrder>(
  {
    // Link to ordering User
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    // Snapshot of items from the cart at time of order
    cartItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        price: Number,
        title: String,
        imageCover: String,
      },
    ],
    // Delivery destination
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
    // Pricing Breakdown
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
    // Payment metadata
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
    // Delivery metadata
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    // Order lifecycle tracking
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    // Track every status change
    statusHistory: [
      {
        status: { type: String, enum: Object.values(OrderStatus) },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true, // Only for card orders
    },
  },
  { timestamps: true },
);

orderSchema.plugin(toJSONPlugin);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
