import mongoose, { Schema, Document, Types } from "mongoose";
import { toJSONPlugin, imageURLPlugin } from "../helpers/mongoosePlugins.js";
import { hashPassword } from "../utils/password.js";

/**
 * User roles for access control
 */
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

/**
 * Account status
 */
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

/**
 * IUser interface extending Mongoose Document
 */
export interface IUser extends Document {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  avatar?: string;
  password: string;
  passwordChangedAt?: Date;
  passwordResetCode?: string;
  passwordResetCodeExpires?: Date;
  passwordResetVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: UserRole;
  status: UserStatus;
  wishlist: Types.ObjectId[];
  addresses: {
    id: Types.ObjectId;
    alias: string;
    details: string;
    phone: string;
    city: string;
    postalCode: string;
  }[];
}

/**
 * User Schema definition
 */
const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true, required: [true, "Name is required"] },
    slug: { type: String, lowercase: true },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
      // Basic regex for email validation
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email address",
      ],
    },
    phone: String,
    avatar: String,
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetCodeExpires: Date,
    passwordResetVerified: Boolean,
    type: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    // Reference to Product model for the wishlist feature
    wishlist: {
      type: [{ type: Types.ObjectId, ref: "Product" }],
      select: false,
    },
    // Sub-document for user shipping/billing addresses
    addresses: {
      type: [
        {
          id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
          alias: {
            type: String,
            required: [true, "Address alias is required"],
            trim: true,
            minlength: [2, "Alias too short"],
            maxlength: [50, "Alias too long"],
          },
          details: {
            type: String,
            required: [true, "Address details are required"],
            trim: true,
            minlength: [10, "Details too short"],
            maxlength: [200, "Details too long"],
          },
          phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
          },
          city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
            minlength: [2, "City name too short"],
            maxlength: [50, "City name too long"],
          },
          postalCode: {
            type: String,
            required: [true, "Postal code is required"],
            trim: true,
            minlength: [3, "Postal code too short"],
            maxlength: [10, "Postal code too long"],
          },
        },
      ],
      select: false,
    },
  },
  {
    // Auto-manage createdAt and updatedAt fields
    timestamps: true,
  },
);

/**
 * Pre-save hook for password hashing and management
 */
userSchema.pre<IUser>("save", async function () {
  // Only hash password if it's new or modified
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);

  // Update passwordChangedAt if password is changed for an existing user
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // 1s buffer for JWT timing
  }
});

/**
 * Apply custom plugins
 * toJSONPlugin: Handles hidden fields like password in JSON responses
 * imageURLPlugin: Appends full URL to image paths
 */
userSchema.plugin(toJSONPlugin, {
  removePassword: true,
  removePasswordFields: true,
});
userSchema.plugin(imageURLPlugin, {
  folderName: "users",
  fields: ["avatar"],
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
