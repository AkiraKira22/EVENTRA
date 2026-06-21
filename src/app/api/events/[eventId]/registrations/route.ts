import { NextResponse } from "next/server";
import type { FilterQuery } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Registration, type IRegistration } from "@/models/Registration";
import { requireUser, AuthError } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { parsePagination, paginationMeta } from "@/lib/http";
import type { EventRegistrationDTO, Role } from "@/types";

type Params = { params: { eventId: string } };

type PopulatedUser = {
  _id: { toString(): string };
  name: string;
  email: string;
  image?: string;
  role: Role;
};

// GET /api/events/[eventId]/registrations — attendees for an event.
// Restricted to the event's organizer or an admin.
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    await connectDB();

    const event = await Event.findById(params.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isOwner = event.organizer.toString() === user.id;
    if (!isOwner && user.role !== "ADMIN") {
      throw new AuthError(
        403,
        "Only the event organizer or an admin can view registrations"
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const { page, limit, skip } = parsePagination(searchParams, {
      defaultLimit: 20,
      maxLimit: 100,
    });

    const filter: FilterQuery<IRegistration> = { event: event._id };
    if (statusParam) filter.status = statusParam as IRegistration["status"];
    else filter.status = { $ne: "CANCELLED" };

    const [regs, total] = await Promise.all([
      Registration.find(filter)
        .populate("user", "name email image role")
        .sort({ registeredAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Registration.countDocuments(filter),
    ]);

    const data: EventRegistrationDTO[] = regs.map((r) => {
      const u = r.user as unknown as PopulatedUser | null;
      return {
        id: r._id.toString(),
        status: r.status,
        notes: r.notes,
        registeredAt: r.registeredAt.toISOString(),
        user: u
          ? {
              id: u._id.toString(),
              name: u.name,
              email: u.email,
              image: u.image,
              role: u.role,
            }
          : null,
      };
    });

    return NextResponse.json({
      registrations: data,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
