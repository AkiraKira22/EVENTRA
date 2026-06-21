// ============================================================
// HTTP helpers shared by API route handlers: CSRF (same-origin) checks and
// pagination parsing.
// ============================================================

export class CsrfError extends Error {
  constructor() {
    super("Request blocked: invalid or cross-site origin.");
    this.name = "CsrfError";
  }
}

/**
 * Explicit CSRF mitigation for state-changing requests.
 *
 * Modern browsers send `Sec-Fetch-Site`; a forged cross-site form/fetch is
 * reported as `cross-site` and rejected. We fall back to comparing the Origin
 * header host against the request Host for older clients. Same-origin fetches
 * from our own UI always pass.
 */
export function assertSameOrigin(request: Request): void {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite) {
    // "same-origin" = our UI; "none" = direct navigation (address bar).
    if (secFetchSite === "same-origin" || secFetchSite === "none") return;
    throw new CsrfError();
  }

  const origin = request.headers.get("origin");
  if (!origin) return; // No usable signal; rely on auth + NextAuth CSRF.

  const host = request.headers.get("host");
  try {
    if (new URL(origin).host !== host) throw new CsrfError();
  } catch {
    throw new CsrfError();
  }
}

export type PageParams = { page: number; limit: number; skip: number };

/** Parse `page` & `limit` query params into safe, clamped pagination values. */
export function parsePagination(
  searchParams: URLSearchParams,
  opts?: { defaultLimit?: number; maxLimit?: number }
): PageParams {
  const defaultLimit = opts?.defaultLimit ?? 12;
  const maxLimit = opts?.maxLimit ?? 50;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawLimit = parseInt(searchParams.get("limit") ?? String(defaultLimit), 10);
  const limit = Math.min(Math.max(1, rawLimit || defaultLimit), maxLimit);

  return { page, limit, skip: (page - 1) * limit };
}

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
};

/** Build the pagination metadata object returned alongside a page of results. */
export function paginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { total, page, limit, totalPages, hasMore: page < totalPages };
}
