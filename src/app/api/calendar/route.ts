import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { getSession, requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

const schema = z.object({ eventId: z.string().min(1) });

// POST /api/calendar — add an event to the user's Google Calendar.
// Only for users signed in via Google (they have an accessToken).
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const session = await getSession();

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

    const { eventId } = schema.parse(await request.json());
    await connectDB();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const endTime =
      event.endDate ?? new Date(event.date.getTime() + 2 * 60 * 60 * 1000);

    const calendarEvent = {
      summary: event.title,
      location: event.location,
      description: `${event.description ?? ""}\n\nRegistered via Eventra.`,
      start: { dateTime: event.date.toISOString(), timeZone: "Asia/Taipei" },
      end: { dateTime: endTime.toISOString(), timeZone: "Asia/Taipei" },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 },
          { method: "email", minutes: 24 * 60 },
        ],
      },
    };

    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      console.error("[GOOGLE CALENDAR]", detail);
      return NextResponse.json(
        { error: "Failed to add to Google Calendar" },
        { status: 502 }
      );
    }

    const created = await res.json();

    await Registration.findOneAndUpdate(
      { user: user.id, event: eventId },
      { calendarAdded: true }
    );

    return NextResponse.json({
      message: "Added to Google Calendar",
      htmlLink: created.htmlLink,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
