"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCog,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { EventStatusBadge } from "@/components/shared/EventStatusBadge";
import { apiGet } from "@/lib/fetcher";
import { useDeleteEvent } from "@/hooks/useEvents";
import { formatEventDate } from "@/lib/utils";
import type { EventDTO } from "@/types";

export function MyEventsList() {
  const [toDelete, setToDelete] = useState<EventDTO | null>(null);
  const deleteEvent = useDeleteEvent();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", { mine: true }],
    queryFn: () =>
      apiGet<{ events: EventDTO[] }>("/api/events?mine=true&scope=all&limit=50"),
    select: (d) => d.events,
  });

  function confirmDelete() {
    if (!toDelete) return;
    deleteEvent.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success("Event deleted");
        setToDelete(null);
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={CalendarCog}
        title="No events yet"
        description="Create your first event and manage its registrations here."
        action={
          <Button asChild>
            <Link href="/events/new">
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="truncate font-semibold hover:text-primary"
                  >
                    {event.title}
                  </Link>
                  <EventStatusBadge status={event.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{formatEventDate(event.date)}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {event.registrationCount}
                    {event.capacity != null && ` / ${event.capacity}`} attendees
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event.id}/manage`}>
                    <Users className="h-4 w-4" />
                    Manage
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setToDelete(event)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              &ldquo;{toDelete?.title}&rdquo; and all of its registrations will be
              permanently deleted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
