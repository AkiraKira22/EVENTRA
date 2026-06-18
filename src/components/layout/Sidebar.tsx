"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { dashboardNav, visibleNav, activeHref } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useCurrentUser();

  const items = visibleNav(dashboardNav, role);
  const active = activeHref(pathname, items.map((i) => i.href));

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 md:block">
      <nav className="sticky top-16 flex flex-col gap-1 p-4">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active === href
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
