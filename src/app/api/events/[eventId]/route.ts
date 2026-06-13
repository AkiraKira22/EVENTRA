import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event, type IEvent } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { eventSchema } from "@/lib/validations";
import { requireUser, getSession, AuthError } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { serializeEvent } from "@/lib/serialize";

type Params = { params: { eventId: string } };

// GET /api/events/[eventId] — single event detail.
export async function GET(_request: Request, { params }: Params) {
  try {
    await connectDB();
    const event = await Event.findById(params.eventId).populate(
      "organizer",
      "name image"
    );
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const session = await getSession();
    let myStatus = null;
    if (session?.user) {
      const reg = await Registration.findOne({
        user: session.user.id,
        event: event._id,
      });
      myStatus = reg?.status ?? null;
    }

    return NextResponse.json({
      event: serializeEvent(event as unknown as IEvent & { organizer: unknown }, {
        myRegistrationStatus: myStatus,
      }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/events/[eventId] — edit an event (owner or ADMIN).
export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    await connectDB();

    const event = await Event.findById(params.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isOwner = event.organizer.toString() === user.id;
    if (!isOwner && user.role !== "ADMIN") {
      throw new AuthError(403, "Only the event owner or an admin can edit this");
    }

    const body = await request.json();
    const data = eventSchema.partial().parse(body);

    if (data.title !== undefined) event.title = data.title;
    if (data.description !== undefined) event.description = data.description || undefined;
    if (data.date) event.date = new Date(data.date);
    if (data.endDate !== undefined)
      event.endDate = data.endDate ? new Date(data.endDate) : undefined;
    if (data.location) event.location = data.location;
    if (data.locationUrl !== undefined) event.locationUrl = data.locationUrl || undefined;
    if (data.capacity !== undefined)
      event.capacity =
        data.capacity === "" || data.capacity == null ? null : Number(data.capacity);
    if (data.tags !== undefined)
      event.tags = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    if (data.imageUrl !== undefined) event.imageUrl = data.imageUrl || undefined;
    if (data.status) event.status = data.status;
    if (data.requiresApproval !== undefined)
      event.requiresApproval = data.requiresApproval;

    await event.save();
    await event.populate("organizer", "name image");

    return NextResponse.json({
      event: serializeEvent(event as unknown as IEvent & { organizer: unknown }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/events/[eventId] — delete an event (owner or ADMIN).
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    await connectDB();

    const event = await Event.findById(params.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isOwner = event.organizer.toString() === user.id;
    if (!isOwner && user.role !== "ADMIN") {
      throw new AuthError(403, "Only the event owner or an admin can delete this");
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
