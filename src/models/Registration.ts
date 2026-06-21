import mongoose, { Schema, model, models, type Model } from "mongoose";
import type { RegistrationStatus } from "@/types";

export interface IRegistration {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  notes?: string;
  calendarAdded: boolean;
  calendarEventId?: string;
  registeredAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "WAITLISTED"],
      default: "CONFIRMED",
    },
    notes: { type: String, trim: true },
    calendarAdded: { type: Boolean, default: false },
    // Google Calendar event id, stored so the event can be removed on cancel.
    calendarEventId: { type: String },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "registeredAt", updatedAt: "updatedAt" } }
);

// A user may have only one registration per event (replaces the old MySQL UNIQUE KEY).
RegistrationSchema.index({ user: 1, event: 1 }, { unique: true });
RegistrationSchema.index({ event: 1, status: 1 });
RegistrationSchema.index({ user: 1, registeredAt: -1 });

export const Registration: Model<IRegistration> =
  (models.Registration as Model<IRegistration>) ||
  model<IRegistration>("Registration", RegistrationSchema);
