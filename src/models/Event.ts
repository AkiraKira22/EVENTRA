import mongoose, { Schema, model, models, type Model } from "mongoose";
import type { EventStatus } from "@/types";

export interface IEvent {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  location: string;
  locationUrl?: string;
  organizer: mongoose.Types.ObjectId;
  capacity: number | null;
  registrationCount: number;
  tags: string[];
  imageUrl?: string;
  status: EventStatus;
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, required: true, trim: true },
    locationUrl: { type: String, trim: true },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    capacity: { type: Number, default: null, min: 1 },
    // Denormalized: recomputed whenever registrations change, so the event
    // list doesn't need an expensive aggregation on every render.
    registrationCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [], index: true },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CANCELLED", "ENDED"],
      default: "DRAFT",
    },
    requiresApproval: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EventSchema.index({ date: 1, status: 1 });

export const Event: Model<IEvent> =
  (models.Event as Model<IEvent>) || model<IEvent>("Event", EventSchema);
