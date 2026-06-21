import "server-only";

// ============================================================
// Thin wrapper around the Google Calendar REST API (primary calendar).
// Used by /api/calendar (add/remove) and the cancel-registration flow.
// ============================================================

const CAL_BASE =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

type CalendarEventInput = {
  title: string;
  location?: string;
  description?: string;
  date: Date;
  endDate?: Date | null;
};

/** Insert an event into the user's primary Google Calendar. Returns its id + link. */
export async function addEventToCalendar(
  accessToken: string,
  event: CalendarEventInput
): Promise<{ id: string; htmlLink: string }> {
  const endTime =
    event.endDate ?? new Date(event.date.getTime() + 2 * 60 * 60 * 1000);

  const body = {
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

  const res = await fetch(CAL_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[GOOGLE CALENDAR add]", await res.json().catch(() => ({})));
    throw new Error("Failed to add to Google Calendar");
  }

  const created = await res.json();
  return { id: created.id as string, htmlLink: created.htmlLink as string };
}

/** Delete an event from the user's primary Google Calendar (idempotent). */
export async function removeEventFromCalendar(
  accessToken: string,
  calendarEventId: string
): Promise<void> {
  const res = await fetch(`${CAL_BASE}/${encodeURIComponent(calendarEventId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // 404/410 = already gone → treat as success.
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    console.error("[GOOGLE CALENDAR remove]", await res.json().catch(() => ({})));
    throw new Error("Failed to remove from Google Calendar");
  }
}
