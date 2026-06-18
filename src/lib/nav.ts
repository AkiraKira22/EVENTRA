import {
  CalendarDays,
  Plus,
  LayoutDashboard,
  CalendarCheck,
  CalendarCog,
  ShieldCheck,
  Users,
  CalendarRange,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * If set, only these roles see the item. Omit for public links that are
   * visible to everyone, including signed-out visitors.
   */
  roles?: Role[];
};

const ALL_ROLES: Role[] = ["ADMIN", "ORGANIZER", "STUDENT"];

/** Primary links shown in the top navbar and the mobile menu. */
export const primaryNav: NavItem[] = [
  { href: "/events", label: "Browse Events", icon: CalendarDays },
  {
    href: "/events/new",
    label: "Create Event",
    icon: Plus,
    roles: ["ADMIN", "ORGANIZER"],
  },
];

/** A one-click shortcut into the dashboard (authenticated users only). */
export const dashboardLink: NavItem = {
  href: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  roles: ALL_ROLES,
};

/** Links shown in the dashboard sidebar and the mobile menu's dashboard section. */
export const dashboardNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ALL_ROLES },
  {
    href: "/dashboard/registrations",
    label: "My Registrations",
    icon: CalendarCheck,
    roles: ALL_ROLES,
  },
  {
    href: "/dashboard/my-events",
    label: "My Events",
    icon: CalendarCog,
    roles: ["ADMIN", "ORGANIZER"],
  },
  { href: "/dashboard/admin", label: "Statistics", icon: ShieldCheck, roles: ["ADMIN"] },
  { href: "/dashboard/admin/users", label: "Manage Users", icon: Users, roles: ["ADMIN"] },
  {
    href: "/dashboard/admin/events",
    label: "Moderate Events",
    icon: CalendarRange,
    roles: ["ADMIN"],
  },
];

/** Keep only the items the current role is allowed to see (public items always show). */
export function visibleNav(items: NavItem[], role?: Role): NavItem[] {
  return items.filter(
    (item) => !item.roles || (role ? item.roles.includes(role) : false)
  );
}

/**
 * Return the single most-specific href that matches the current pathname, or null.
 * Using the longest match prevents a parent link (e.g. /dashboard/admin) from
 * staying highlighted while you're on a child page (/dashboard/admin/users).
 */
export function activeHref(pathname: string, hrefs: string[]): string | null {
  let best: string | null = null;
  for (const href of hrefs) {
    const prefix = href.endsWith("/") ? href : `${href}/`;
    const matches = pathname === href || pathname.startsWith(prefix);
    if (matches && (best === null || href.length > best.length)) best = href;
  }
  return best;
}
