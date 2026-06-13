import "server-only";
import { connectDB } from "@/lib/mongodb";
import { Event, type IEvent } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { serializeEvent } from "@/lib/serialize";
import { getSession } from "@/lib/auth";
import type { EventDTO } from "@/types";

/**
 * Ambil acara langsung dari DB untuk Server Components (mis. landing page).
 * Aman dipanggil saat render server; mengembalikan [] bila DB belum dikonfigurasi.
 */
export async function getUpcomingEvents(limit = 6): Promise<EventDTO[]> {
  try {
    await connectDB();
    const events = await Event.find({
      status: "PUBLISHED",
      date: { $gte: new Date() },
    })
      .populate("organizer", "name image")
      .sort({ date: 1 })
      .limit(limit)
      .lean<(IEvent & { organizer: unknown })[]>();

    return events.map((e) =>
      serializeEvent(e as IEvent & { organizer: unknown })
    );
  } catch (e) {
    console.error("[getUpcomingEvents]", e);
    return [];
  }
}

/** Ambil satu acara untuk halaman detail (server component), termasuk status pendaftaran user. */
export async function getEventById(id: string): Promise<EventDTO | null> {
  try {
    await connectDB();
    const event = await Event.findById(id)
      .populate("organizer", "name image")
      .lean<(IEvent & { organizer: unknown }) | null>();
    if (!event) return null;

    const session = await getSession();
    let myStatus = null;
    if (session?.user) {
      const reg = await Registration.findOne({
        user: session.user.id,
        event: event._id,
      }).lean();
      myStatus = reg?.status ?? null;
    }

    return serializeEvent(event as IEvent & { organizer: unknown }, {
      myRegistrationStatus: myStatus,
    });
  } catch (e) {
    console.error("[getEventById]", e);
    return null;
  }
}
