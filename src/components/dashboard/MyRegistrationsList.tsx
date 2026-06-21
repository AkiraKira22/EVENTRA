"use client";

import Link from "next/link";
import {
  CalendarCheck,
  CalendarPlus,
  CalendarX,
  Loader2,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { RegistrationStatusBadge } from "@/components/shared/EventStatusBadge";
import {
  useMyRegistrations,
  useAddToCalendar,
  useRemoveFromCalendar,
} from "@/hooks/useRegistrations";
import { formatEventDate } from "@/lib/utils";

export function MyRegistrationsList() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyRegistrations();
  const calendar = useAddToCalendar();
  const removeCalendar = useRemoveFromCalendar();

  const registrations = data?.pages.flatMap((p) => p.registrations) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="No registrations yet"
        description="Events you register for will appear here."
        action={
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        }
      />
    );
  }

  function addToCalendar(eventId: string) {
    toast.promise(calendar.mutateAsync(eventId), {
      loading: "Adding to Google Calendar…",
      success: "Added to Google Calendar 🎉",
      error: (e) => (e as Error).message,
    });
  }

  function removeFromCalendar(eventId: string) {
    toast.promise(removeCalendar.mutateAsync(eventId), {
      loading: "Removing from Google Calendar…",
      success: "Removed from Google Calendar",
      error: (e) => (e as Error).message,
    });
  }

  return (
    <div className="space-y-4">
      {registrations.map((reg) => (
        <Card key={reg.id}>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/events/${reg.event.id}`}
                  className="truncate font-semibold hover:text-primary"
                >
                  {reg.event.title}
                </Link>
                <RegistrationStatusBadge status={reg.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{formatEventDate(reg.event.date)}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {reg.event.location}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              {reg.calendarAdded ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCalendar(reg.event.id)}
                  disabled={removeCalendar.isPending}
                >
                  <CalendarX className="h-4 w-4" />
                  Remove from calendar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToCalendar(reg.event.id)}
                  disabled={calendar.isPending}
                >
                  <CalendarPlus className="h-4 w-4" />
                  Add to Calendar
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/events/${reg.event.id}`}>Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

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
    </div>
  );
}
