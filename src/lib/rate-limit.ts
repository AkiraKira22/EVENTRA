// ============================================================
// In-memory rate limiter (fixed-window) keyed by an arbitrary string.
//
// Good enough for a single Node server / brute-force protection on auth.
// For multi-instance deployments swap the Map for Redis (Upstash) — the
// public API here (`assertRateLimit`) stays the same.
// ============================================================

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super("Too many requests. Please slow down and try again later.");
    this.name = "RateLimitError";
  }
}

/** Record a hit for `key` and report whether it is within the allowed window. */
export function rateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number }
): RateLimitResult {
  const limit = opts?.limit ?? 5;
  const windowMs = opts?.windowMs ?? 60_000;
  const now = Date.now();

  // Opportunistic cleanup so the map doesn't grow without bound.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  return {
    success: existing.count <= limit,
    limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Throw RateLimitError (→ HTTP 429) when the limit for `key` is exceeded. */
export function assertRateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number }
): RateLimitResult {
  const result = rateLimit(key, opts);
  if (!result.success) throw new RateLimitError(result.retryAfterSeconds);
  return result;
}

/** Best-effort client IP from proxy headers (Vercel / nginx) for keying limits. */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** Test-only: clear all buckets. */
export function __resetRateLimit() {
  buckets.clear();
}
