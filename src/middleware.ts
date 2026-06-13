import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Edge middleware — lapisan pertama RBAC.
 * Memblokir navigasi halaman berdasarkan role SEBELUM halaman dirender,
 * tanpa perlu query database. Keamanan sesungguhnya tetap ada di API routes.
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  // Belum login → arahkan ke /login dengan callback.
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  // Area admin hanya untuk ADMIN.
  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Buat acara & kelola acara hanya untuk ORGANIZER/ADMIN.
  if (
    (pathname.startsWith("/events/new") ||
      pathname.startsWith("/dashboard/my-events")) &&
    role !== "ORGANIZER" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/events/new"],
};
