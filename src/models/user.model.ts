import mongoose, { Schema, Document } from "mongoose";
import { toJSONPlugin, imageURLPlugin } from "../helpers/mongoosePlugins.js";
import { hashPassword } from "../utils/password.js";

enum UserRole {
  ADMIN = "admin",
  USER = "user",
}
enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface IUser extends Document {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  avatar?: string;
  password: string;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  type: UserRole;
  status: UserStatus;
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
    passwordChangedAt: Date,
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
  },
  {
    timestamps: true,
  },
);

userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hashPassword(this.password);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // Subtract 1s to ensure token iat is after passwordChangedAt
  }
});

userSchema.plugin(toJSONPlugin, { removePassword: true });
userSchema.plugin(imageURLPlugin, {
  folderName: "users",
  fields: ["avatar"],
});
const User = mongoose.model<IUser>("User", userSchema);

export default User;
