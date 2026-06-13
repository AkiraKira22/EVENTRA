import mongoose, { Schema, model, models, type Model } from "mongoose";
import type { Role } from "@/types";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  googleId?: string;
  image?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    // select:false → password is never included in regular queries.
    // For login, fetch it explicitly with .select("+password").
    password: { type: String, select: false },
    googleId: { type: String, sparse: true, unique: true },
    image: { type: String },
    role: {
      type: String,
      enum: ["ADMIN", "ORGANIZER", "STUDENT"],
      default: "STUDENT",
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>("User", UserSchema);
