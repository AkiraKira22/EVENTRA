import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { serializeUser } from "@/lib/serialize";
import { assertSameOrigin } from "@/lib/http";

type Params = { params: { userId: string } };

const patchSchema = z.object({
  role: z.enum(["ADMIN", "ORGANIZER", "STUDENT"]).optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/users/[userId] — change role or active status (ADMIN only).
export async function PATCH(request: Request, { params }: Params) {
  try {
    assertSameOrigin(request);
    const admin = await requireRole("ADMIN");
    await connectDB();

    // An admin must not demote/deactivate their own account (prevents lockout).
    if (admin.id === params.userId) {
      return NextResponse.json(
        { error: "You can't change your own role or status" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = patchSchema.parse(body);

    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (data.role !== undefined) user.role = data.role;
    if (data.isActive !== undefined) user.isActive = data.isActive;
    await user.save();

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
