import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { serializeUser } from "@/lib/serialize";

// GET /api/users — list all users (ADMIN only).
export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(query).sort({ createdAt: -1 }).limit(200);
    return NextResponse.json({ users: users.map(serializeUser) });
  } catch (error) {
    return handleApiError(error);
  }
}
