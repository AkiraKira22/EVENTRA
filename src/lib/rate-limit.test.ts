import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimit,
  assertRateLimit,
  RateLimitError,
  getClientIp,
  __resetRateLimit,
} from "@/lib/rate-limit";

beforeEach(() => __resetRateLimit());

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("a", { limit: 3 }).success).toBe(true);
    }
    expect(rateLimit("a", { limit: 3 }).success).toBe(false);
  });

  it("reports remaining attempts", () => {
    expect(rateLimit("b", { limit: 5 }).remaining).toBe(4);
    expect(rateLimit("b", { limit: 5 }).remaining).toBe(3);
  });

  it("keys are independent", () => {
    rateLimit("c", { limit: 1 });
    expect(rateLimit("d", { limit: 1 }).success).toBe(true);
  });
});

describe("assertRateLimit", () => {
  it("throws RateLimitError once the limit is exceeded", () => {
    assertRateLimit("e", { limit: 1 });
    expect(() => assertRateLimit("e", { limit: 1 })).toThrow(RateLimitError);
  });
});

describe("getClientIp", () => {
  it("uses the first IP in x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(h)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
