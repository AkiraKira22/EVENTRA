import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";

/**
 * Turn any error into a consistent JSON response.
 * Used in the catch block of every API Route Handler.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const first = error.errors[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid input", issues: error.errors },
      { status: 400 }
    );
  }

  // MongoDB duplicate key (e.g. registering twice / email already exists).
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  ) {
    return NextResponse.json(
      { error: "This record already exists (duplicate)" },
      { status: 409 }
    );
  }

  // Mongoose errors: invalid ID (CastError) or schema validation failure.
  const name = (error as { name?: string })?.name;
  if (name === "CastError") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  if (name === "ValidationError") {
    const msg =
      (error as { message?: string }).message ?? "Invalid data";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  console.error("[API ERROR]", error);
  return NextResponse.json(
    { error: "An internal server error occurred" },
    { status: 500 }
  );
}
