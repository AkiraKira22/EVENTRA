import { NextResponse } from "next/server";
import type { FilterQuery } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { User, type IUser } from "@/models/User";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { serializeUser } from "@/lib/serialize";
import { parsePagination, paginationMeta } from "@/lib/http";

// GET /api/users — list all users (ADMIN only, paginated).
export async function GET(request: Request) {
  try {
    await requireRole("ADMIN");
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const query: FilterQuery<IUser> = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const { page, limit, skip } = parsePagination(searchParams, {
      defaultLimit: 20,
      maxLimit: 100,
    });

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users: users.map(serializeUser),
      pagination: paginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
