"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EventFilters as Filters } from "@/types";

const SCOPES: { value: NonNullable<Filters["scope"]>; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

export function EventFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events, location, or topic…"
          className="pl-9"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="inline-flex rounded-lg border border-border/60 bg-card p-1">
        {SCOPES.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange({ ...filters, scope: s.value })}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              (filters.scope ?? "upcoming") === s.value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
