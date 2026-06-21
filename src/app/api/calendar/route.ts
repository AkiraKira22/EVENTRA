import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { getSession, requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { assertSameOrigin } from "@/lib/http";
import {
  addEventToCalendar,
  removeEventFromCalendar,
} from "@/lib/google-calendar";

const schema = z.object({ eventId: z.string().min(1) });

function ensureGoogleSession(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session?.accessToken) {
    return NextResponse.json(
      {
        error:
          "This feature is only for Google accounts. Sign in with Google or download the .ics file.",
      },
      { status: 403 }
    );
  }
  if (session.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      { error: "Your Google session expired. Please sign in with Google again." },
      { status: 401 }
    );
  }
  return null;
}

// POST /api/calendar — add an event to the user's Google Calendar.
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const session = await getSession();

    const guard = ensureGoogleSession(session);
    if (guard) return guard;

    const { eventId } = schema.parse(await request.json());
    await connectDB();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { id, htmlLink } = await addEventToCalendar(session!.accessToken!, {
      title: event.title,
      location: event.location,
      description: event.description,
      date: event.date,
      endDate: event.endDate,
    });

    await Registration.findOneAndUpdate(
      { user: user.id, event: eventId },
      { calendarAdded: true, calendarEventId: id }
    );

    return NextResponse.json({ message: "Added to Google Calendar", htmlLink });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Google Calendar")) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return handleApiError(error);
  }
}

// DELETE /api/calendar — remove a previously-added event from Google Calendar.
export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireUser();
    const session = await getSession();

    const guard = ensureGoogleSession(session);
    if (guard) return guard;

    const { eventId } = schema.parse(await request.json());
    await connectDB();

    const reg = await Registration.findOne({ user: user.id, event: eventId });
    if (!reg?.calendarAdded || !reg.calendarEventId) {
      return NextResponse.json(
        { error: "This event isn't in your Google Calendar" },
        { status: 404 }
      );
    }

    await removeEventFromCalendar(session!.accessToken!, reg.calendarEventId);

    reg.calendarAdded = false;
    reg.calendarEventId = undefined;
    await reg.save();

    return NextResponse.json({ message: "Removed from Google Calendar" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Google Calendar")) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    return handleApiError(error);
  }
}
