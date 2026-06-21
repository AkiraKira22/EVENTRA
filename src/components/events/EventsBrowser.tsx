"use client";

import { useState } from "react";
import { CalendarSearch, Loader2 } from "lucide-react";
import { EventFilters } from "./EventFilters";
import { EventGrid, EventGridSkeleton } from "./EventGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useInfiniteEvents } from "@/hooks/useEvents";
import type { EventFilters as Filters } from "@/types";

export function EventsBrowser() {
  const [filters, setFilters] = useState<Filters>({ scope: "upcoming" });
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteEvents(filters);

  const events = data?.pages.flatMap((p) => p.events) ?? [];
  const total = data?.pages[0]?.pagination.total ?? 0;

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
      ) : events.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {events.length} of {total} event{total === 1 ? "" : "s"}
          </p>
          <EventGrid events={events} />
          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </>
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
