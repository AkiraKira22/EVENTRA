import { describe, it, expect } from "vitest";
import { visibleNav, activeHref, primaryNav, dashboardNav } from "@/lib/nav";

describe("visibleNav (role gating / RBAC)", () => {
  it("hides organizer-only items from signed-out visitors", () => {
    const items = visibleNav(primaryNav, undefined);
    expect(items.some((i) => i.href === "/events")).toBe(true); // public
    expect(items.some((i) => i.href === "/events/new")).toBe(false); // gated
  });

  it("shows the create-event link to organizers", () => {
    expect(
      visibleNav(primaryNav, "ORGANIZER").some((i) => i.href === "/events/new")
    ).toBe(true);
  });

  it("restricts admin dashboard links to admins", () => {
    expect(
      visibleNav(dashboardNav, "STUDENT").some((i) => i.href === "/dashboard/admin")
    ).toBe(false);
    expect(
      visibleNav(dashboardNav, "ADMIN").some((i) => i.href === "/dashboard/admin")
    ).toBe(true);
  });
});

describe("activeHref", () => {
  const hrefs = ["/dashboard", "/dashboard/admin", "/dashboard/admin/users"];

  it("selects the most specific matching href", () => {
    expect(activeHref("/dashboard/admin/users", hrefs)).toBe("/dashboard/admin/users");
    expect(activeHref("/dashboard/admin", hrefs)).toBe("/dashboard/admin");
    expect(activeHref("/dashboard", hrefs)).toBe("/dashboard");
  });

  it("returns null when nothing matches", () => {
    expect(activeHref("/events", ["/dashboard"])).toBeNull();
  });
});
