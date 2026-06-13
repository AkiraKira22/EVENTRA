"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarCog,
  LayoutDashboard,
  ShieldCheck,
  Users,
  CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Role } from "@/types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["ADMIN", "ORGANIZER", "STUDENT"],
  },
  {
    href: "/dashboard/registrations",
    label: "My Registrations",
    icon: CalendarCheck,
    roles: ["ADMIN", "ORGANIZER", "STUDENT"],
  },
  {
    href: "/dashboard/my-events",
    label: "My Events",
    icon: CalendarCog,
    roles: ["ADMIN", "ORGANIZER"],
  },
  {
    href: "/dashboard/admin",
    label: "Statistics",
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/admin/users",
    label: "Manage Users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    href: "/dashboard/admin/events",
    label: "Moderate Events",
    icon: CalendarRange,
    roles: ["ADMIN"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useCurrentUser();

  const items = NAV.filter((item) => (role ? item.roles.includes(role) : false));

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 md:block">
      <nav className="sticky top-16 flex flex-col gap-1 p-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
