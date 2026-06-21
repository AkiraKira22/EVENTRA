import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { serializeRegistration } from "@/lib/serialize";
import { parsePagination, paginationMeta } from "@/lib/http";

// GET /api/registrations — the signed-in user's registrations (paginated).
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, {
      defaultLimit: 12,
      maxLimit: 50,
    });

    const filter = { user: user.id, status: { $ne: "CANCELLED" } } as const;

    const [regs, total] = await Promise.all([
      Registration.find(filter)
        .populate({
          path: "event",
          populate: { path: "organizer", select: "name image" },
        })
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Registration.countDocuments(filter),
    ]);

    const data = regs
      .filter((r) => r.event) // event may have been deleted
      .map((r) => serializeRegistration(r as never));

    return NextResponse.json({
      registrations: data,
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
