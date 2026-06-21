import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { requireRole } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { assertSameOrigin } from "@/lib/http";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Detect the real image type from magic bytes — don't trust the client-supplied
 * MIME type, which can be spoofed to smuggle a script past validation.
 */
function sniffImageExt(buf: Buffer): "jpg" | "png" | "webp" | "gif" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "jpg";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return "png";
  if (
    buf.length >= 4 &&
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38
  )
    return "gif";
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  )
    return "webp";
  return null;
}

// POST /api/upload — accept an image file (organizer/admin) and return its URL.
//
// Stores to /public/uploads (works for `next dev` / `next start` on a writable
// filesystem). For serverless/multi-instance, set up object storage (S3 /
// Cloudinary) and swap the write step — see README.
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireRole("ORGANIZER", "ADMIN");
    assertRateLimit(`upload:${getClientIp(request.headers)}`, {
      limit: 20,
      windowMs: 60_000,
    });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 5 MB)" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = sniffImageExt(buffer);
    if (!ext) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, WebP, or GIF." },
        { status: 415 }
      );
    }

    const filename = `${randomUUID()}.${ext}`;
    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
