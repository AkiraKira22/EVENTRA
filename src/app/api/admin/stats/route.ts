import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Event } from "@/models/Event";
import { Registration } from "@/models/Registration";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import type { AdminStats, Role } from "@/types";

// GET /api/admin/stats — ringkasan statistik untuk dashboard admin.
export async function GET() {
  try {
    await requireRole("ADMIN");
    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalEvents,
      publishedEvents,
      totalRegistrations,
      registrationsToday,
      roleAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: "PUBLISHED" }),
      Registration.countDocuments({ status: { $ne: "CANCELLED" } }),
      Registration.countDocuments({ registeredAt: { $gte: startOfToday } }),
      User.aggregate<{ _id: Role; count: number }>([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
    ]);

    const usersByRole: Record<Role, number> = {
      ADMIN: 0,
      ORGANIZER: 0,
      STUDENT: 0,
    };
    for (const r of roleAgg) usersByRole[r._id] = r.count;

    const stats: AdminStats = {
      totalUsers,
      totalEvents,
      publishedEvents,
      totalRegistrations,
      registrationsToday,
      usersByRole,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    return handleApiError(error);
  }
}
