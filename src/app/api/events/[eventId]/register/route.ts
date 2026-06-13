import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { registerForEventSchema } from "@/lib/validations";
import type { RegistrationStatus } from "@/types";

type Params = { params: { eventId: string } };

// POST /api/events/[eventId]/register — register for an event.
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    await connectDB();

    const event = await Event.findById(params.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Registration for this event is not open yet" },
        { status: 400 }
      );
    }
    if (event.date < new Date()) {
      return NextResponse.json(
        { error: "This event has already passed" },
        { status: 400 }
      );
    }

    // Already registered?
    const existing = await Registration.findOne({
      user: user.id,
      event: event._id,
    });
    if (existing && existing.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "You're already registered for this event" },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { notes } = registerForEventSchema.parse(body ?? {});

    // Determine status: full → WAITLISTED, needs approval → PENDING, otherwise → CONFIRMED.
    const isFull =
      event.capacity != null && event.registrationCount >= event.capacity;
    let status: RegistrationStatus = "CONFIRMED";
    if (isFull) status = "WAITLISTED";
    else if (event.requiresApproval) status = "PENDING";

    if (existing) {
      // Reactivate a previously cancelled registration.
      existing.status = status;
      existing.notes = notes;
      existing.calendarAdded = false;
      await existing.save();
    } else {
      await Registration.create({
        user: user.id,
        event: event._id,
        status,
        notes,
      });
    }

    // Only increment the count when actually taking a slot (not the waitlist).
    if (status !== "WAITLISTED") {
      event.registrationCount += 1;
      await event.save();
    }

    return NextResponse.json(
      {
        message:
          status === "WAITLISTED"
            ? "Event is full — you've been added to the waitlist"
            : status === "PENDING"
              ? "Registration submitted, awaiting approval"
              : "Registered successfully",
        status,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/events/[eventId]/register — cancel your own registration.
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    await connectDB();

    const reg = await Registration.findOne({
      user: user.id,
      event: params.eventId,
    });
    if (!reg || reg.status === "CANCELLED") {
      return NextResponse.json(
        { error: "You're not registered for this event" },
        { status: 404 }
      );
    }

    const tookSlot = reg.status !== "WAITLISTED";
    reg.status = "CANCELLED";
    await reg.save();

    if (tookSlot) {
      await Event.findByIdAndUpdate(params.eventId, {
        $inc: { registrationCount: -1 },
      });
    }

    return NextResponse.json({ message: "Registration cancelled" });
  } catch (error) {
    return handleApiError(error);
  }
}
