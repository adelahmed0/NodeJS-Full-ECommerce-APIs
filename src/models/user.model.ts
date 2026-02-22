import mongoose, { Schema, Document } from "mongoose";
import { toJSONPlugin } from "../helpers/mongoosePlugins.js";

enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser extends Document {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  avatar?: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  type: UserRole;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true, required: [true, "Name is required"] },
    slug: { type: String, lowercase: true },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
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
    type: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.plugin(toJSONPlugin);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
