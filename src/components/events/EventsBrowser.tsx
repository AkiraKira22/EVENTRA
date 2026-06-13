"use client";

import { useState } from "react";
import { CalendarSearch } from "lucide-react";
import { EventFilters } from "./EventFilters";
import { EventGrid, EventGridSkeleton } from "./EventGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { useEvents } from "@/hooks/useEvents";
import type { EventFilters as Filters } from "@/types";

export function EventsBrowser() {
  const [filters, setFilters] = useState<Filters>({ scope: "upcoming" });
  const { data: events, isLoading, isError, error } = useEvents(filters);

  return (
    <div className="space-y-8">
      <EventFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <EventGridSkeleton />
      ) : isError ? (
        <EmptyState
          icon={CalendarSearch}
          title="Failed to load events"
          description={(error as Error)?.message ?? "Please reload the page."}
        />
      ) : events && events.length > 0 ? (
        <EventGrid events={events} />
      ) : (
        <EmptyState
          icon={CalendarSearch}
          title="No events found"
          description="Try changing your search keywords or time filter."
        />
      )}
    </div>
  );
}
