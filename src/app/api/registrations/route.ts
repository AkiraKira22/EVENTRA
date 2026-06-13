import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Registration } from "@/models/Registration";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { serializeRegistration } from "@/lib/serialize";

// GET /api/registrations — daftar pendaftaran milik user yang sedang login.
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const regs = await Registration.find({
      user: user.id,
      status: { $ne: "CANCELLED" },
    })
      .populate({
        path: "event",
        populate: { path: "organizer", select: "name image" },
      })
      .sort({ registeredAt: -1 })
      .lean();

    const data = regs
      .filter((r) => r.event) // event mungkin sudah dihapus
      .map((r) => serializeRegistration(r as never));

    return NextResponse.json({ registrations: data });
  } catch (error) {
    return handleApiError(error);
  }
}
