import { describe, it, expect } from "vitest";
import { stripHtml, sanitizeText, sanitizeMultiline } from "@/lib/sanitize";

describe("stripHtml", () => {
  it("removes simple tags", () => {
    expect(stripHtml("<b>Hi</b>")).toBe("Hi");
  });

  it("drops <script> blocks including their contents", () => {
    expect(stripHtml("<script>alert(1)</script>ok")).toBe("ok");
  });

  it("removes a malicious <img onerror> tag entirely", () => {
    expect(stripHtml('<img src=x onerror="steal()">')).toBe("");
  });

  it("strips HTML comments", () => {
    expect(stripHtml("a<!-- secret -->b")).toBe("ab");
  });
});

describe("sanitizeText", () => {
  it("collapses whitespace and strips HTML", () => {
    expect(sanitizeText("  <b>Hello</b>   World  ")).toBe("Hello World");
  });

  it("returns undefined for blank input", () => {
    expect(sanitizeText("   ")).toBeUndefined();
    expect(sanitizeText(null)).toBeUndefined();
    expect(sanitizeText(undefined)).toBeUndefined();
  });
});

describe("sanitizeMultiline", () => {
  it("preserves paragraph breaks but collapses extra blank lines", () => {
    expect(sanitizeMultiline("Line1\n\n\n\nLine2")).toBe("Line1\n\nLine2");
  });

  it("strips HTML while keeping text", () => {
    expect(sanitizeMultiline("<p>Hello</p>\nWorld")).toBe("Hello\nWorld");
  });
});
