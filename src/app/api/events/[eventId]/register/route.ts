import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { getSession, requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { registerForEventSchema } from "@/lib/validations";
import { assertSameOrigin } from "@/lib/http";
import { sanitizeMultiline } from "@/lib/sanitize";
import { sendRegistrationEmail } from "@/lib/email";
import { promoteFromWaitlist } from "@/lib/registrations";
import { removeEventFromCalendar } from "@/lib/google-calendar";
import type { RegistrationStatus } from "@/types";

type Params = { params: { eventId: string } };

// POST /api/events/[eventId]/register — register for an event.
export async function POST(request: Request, { params }: Params) {
  try {
    assertSameOrigin(request);
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
    const parsed = registerForEventSchema.parse(body ?? {});
    const notes = sanitizeMultiline(parsed.notes);

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
      existing.calendarEventId = undefined;
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

    // Fire the appropriate confirmation email (no-op if SMTP unconfigured).
    if (user.email) {
      await sendRegistrationEmail({
        to: user.email,
        name: user.name,
        event: { id: event._id.toString(), title: event.title, date: event.date },
        status,
      });
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
export async function DELETE(request: Request, { params }: Params) {
  try {
    assertSameOrigin(request);
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

    // Best-effort: pull the event from the user's Google Calendar if it's there.
    if (reg.calendarAdded && reg.calendarEventId) {
      const session = await getSession();
      if (session?.accessToken) {
        try {
          await removeEventFromCalendar(session.accessToken, reg.calendarEventId);
        } catch (e) {
          console.error("[cancel] calendar removal failed", e);
        }
      }
    }

    const tookSlot = reg.status !== "WAITLISTED";
    reg.status = "CANCELLED";
    reg.calendarAdded = false;
    reg.calendarEventId = undefined;
    await reg.save();

    if (tookSlot) {
      const event = await Event.findById(params.eventId);
      if (event) {
        event.registrationCount = Math.max(0, event.registrationCount - 1);
        await event.save();
        // A slot opened up — promote the next person off the waitlist.
        await promoteFromWaitlist(event);
      }
    }

    return NextResponse.json({ message: "Registration cancelled" });
  } catch (error) {
    return handleApiError(error);
  }
}
