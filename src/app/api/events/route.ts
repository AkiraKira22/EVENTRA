import { NextResponse } from "next/server";
import type { FilterQuery } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Event, type IEvent } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { eventSchema } from "@/lib/validations";
import { requireRole, getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { serializeEvent } from "@/lib/serialize";
import type { RegistrationStatus } from "@/types";

// GET /api/events — daftar acara (publik), dengan filter & pencarian.
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const tag = searchParams.get("tag");
    const scope = searchParams.get("scope") ?? "upcoming";
    const organizer = searchParams.get("organizer");
    const statusParam = searchParams.get("status");
    const mine = searchParams.get("mine") === "true";

    const query: FilterQuery<IEvent> = {};
    const session = await getSession();

    if (mine) {
      // Acara milik user yang login — tampilkan semua status (termasuk draf).
      if (!session?.user) {
        return NextResponse.json({ events: [] });
      }
      query.organizer = session.user.id;
      if (statusParam) query.status = statusParam as IEvent["status"];
    } else {
      // Publik hanya melihat acara PUBLISHED kecuali admin minta status tertentu.
      query.status = (
        statusParam && session?.user?.role === "ADMIN" ? statusParam : "PUBLISHED"
      ) as IEvent["status"];
      if (organizer) query.organizer = organizer;
    }

    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (scope === "upcoming") query.date = { $gte: new Date() };
    else if (scope === "past") query.date = { $lt: new Date() };

    const events = await Event.find(query)
      .populate("organizer", "name image")
      .sort({ date: scope === "past" ? -1 : 1 })
      .limit(100)
      .lean<(IEvent & { organizer: unknown })[]>();

    // Jika user login, tandai status pendaftarannya untuk tiap acara.
    let myRegs: Record<string, RegistrationStatus> = {};
    if (session?.user) {
      const regs = await Registration.find({
        user: session.user.id,
        event: { $in: events.map((e) => e._id) },
      }).lean();
      myRegs = Object.fromEntries(
        regs.map((r) => [r.event.toString(), r.status])
      );
    }

    const data = events.map((e) =>
      serializeEvent(e as IEvent & { organizer: unknown }, {
        myRegistrationStatus: myRegs[e._id.toString()] ?? null,
      })
    );

    return NextResponse.json({ events: data });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/events — buat acara baru (ORGANIZER / ADMIN).
export async function POST(request: Request) {
  try {
    const user = await requireRole("ORGANIZER", "ADMIN");
    const body = await request.json();
    const data = eventSchema.parse(body);

    await connectDB();

    const tags = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const event = await Event.create({
      title: data.title,
      description: data.description || undefined,
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      location: data.location,
      locationUrl: data.locationUrl || undefined,
      organizer: user.id,
      capacity: data.capacity === "" || data.capacity == null ? null : Number(data.capacity),
      tags,
      imageUrl: data.imageUrl || undefined,
      status: data.status,
      requiresApproval: data.requiresApproval,
    });

    await event.populate("organizer", "name image");

    return NextResponse.json(
      { event: serializeEvent(event as unknown as IEvent & { organizer: unknown }) },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
