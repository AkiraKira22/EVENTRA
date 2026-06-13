import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error";
import { serializeUser } from "@/lib/serialize";

// POST /api/auth/register — create a new account with email + password.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || undefined,
      password: hashed,
      role: "STUDENT",
    });

    return NextResponse.json(
      { message: "Account created successfully", user: serializeUser(user) },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
