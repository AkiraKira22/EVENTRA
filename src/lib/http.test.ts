import { describe, it, expect } from "vitest";
import {
  parsePagination,
  paginationMeta,
  assertSameOrigin,
  CsrfError,
} from "@/lib/http";

const fakeReq = (headers: Record<string, string>) =>
  ({
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
  }) as unknown as Request;

describe("parsePagination", () => {
  it("applies sensible defaults", () => {
    expect(parsePagination(new URLSearchParams())).toEqual({
      page: 1,
      limit: 12,
      skip: 0,
    });
  });

  it("clamps the limit to maxLimit", () => {
    expect(parsePagination(new URLSearchParams("limit=999"), { maxLimit: 50 }).limit).toBe(50);
  });

  it("computes skip from page and limit", () => {
    expect(parsePagination(new URLSearchParams("page=3&limit=10")).skip).toBe(20);
  });

  it("guards against invalid/negative page", () => {
    expect(parsePagination(new URLSearchParams("page=-5")).page).toBe(1);
    expect(parsePagination(new URLSearchParams("page=abc")).page).toBe(1);
  });
});

describe("paginationMeta", () => {
  it("computes totalPages and hasMore", () => {
    expect(paginationMeta(25, 1, 10)).toEqual({
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
      hasMore: true,
    });
    expect(paginationMeta(25, 3, 10).hasMore).toBe(false);
  });

  it("never reports fewer than one page", () => {
    expect(paginationMeta(0, 1, 10).totalPages).toBe(1);
  });
});

describe("assertSameOrigin", () => {
  it("allows same-origin and direct navigation", () => {
    expect(() => assertSameOrigin(fakeReq({ "sec-fetch-site": "same-origin" }))).not.toThrow();
    expect(() => assertSameOrigin(fakeReq({ "sec-fetch-site": "none" }))).not.toThrow();
  });

  it("blocks cross-site requests", () => {
    expect(() => assertSameOrigin(fakeReq({ "sec-fetch-site": "cross-site" }))).toThrow(CsrfError);
  });

  it("blocks an Origin host that doesn't match Host", () => {
    expect(() =>
      assertSameOrigin(fakeReq({ origin: "http://evil.com", host: "myapp.com" }))
    ).toThrow(CsrfError);
  });

  it("allows a matching Origin/Host and when no signals exist", () => {
    expect(() =>
      assertSameOrigin(fakeReq({ origin: "http://myapp.com", host: "myapp.com" }))
    ).not.toThrow();
    expect(() => assertSameOrigin(fakeReq({}))).not.toThrow();
  });
});
