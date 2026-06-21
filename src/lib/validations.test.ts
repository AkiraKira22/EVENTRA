import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, eventSchema } from "@/lib/validations";

describe("registerSchema", () => {
  const base = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password1",
    confirmPassword: "password1",
  };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    expect(
      registerSchema.safeParse({ ...base, confirmPassword: "different" }).success
    ).toBe(false);
  });

  it("rejects a password shorter than 8 chars", () => {
    expect(
      registerSchema.safeParse({ ...base, password: "short", confirmPassword: "short" })
        .success
    ).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(registerSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a valid email and a password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("eventSchema", () => {
  const base = { title: "My Workshop", date: "2030-01-01T10:00", location: "Main Hall" };

  it("applies defaults for status and approval", () => {
    const parsed = eventSchema.parse(base);
    expect(parsed.status).toBe("PUBLISHED");
    expect(parsed.requiresApproval).toBe(false);
  });

  it("rejects a title shorter than 3 chars", () => {
    expect(eventSchema.safeParse({ ...base, title: "ab" }).success).toBe(false);
  });

  it("rejects an invalid image URL", () => {
    expect(eventSchema.safeParse({ ...base, imageUrl: "not-a-url" }).success).toBe(false);
  });

  it("accepts an empty optional image URL", () => {
    expect(eventSchema.safeParse({ ...base, imageUrl: "" }).success).toBe(true);
  });
});
