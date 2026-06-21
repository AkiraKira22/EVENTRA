"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange, Loader2, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatShortDate } from "@/lib/utils";
import type { EventDTO, EventStatus } from "@/types";

const TABS: { value: EventStatus; label: string }[] = [
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "ENDED", label: "Ended" },
];

export function AdminEventsView() {
  const [status, setStatus] = useState<EventStatus>("PUBLISHED");
  const [toDelete, setToDelete] = useState<EventDTO | null>(null);
  const deleteEvent = useDeleteEvent();

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", { admin: true, status }],
    queryFn: () =>
      apiGet<{ events: EventDTO[] }>(
        `/api/events?status=${status}&scope=all&limit=50`
      ),
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

  return (
    <div className="space-y-5">
      <Tabs value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No events"
          description="There are no events with this status yet."
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Link
                      href={`/events/${event.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {event.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.organizer.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatShortDate(event.date)}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {event.registrationCount}
                      {event.capacity != null && `/${event.capacity}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={event.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild title="Manage registrations">
                        <Link href={`/events/${event.id}/manage`}>
                          <Users className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Edit event">
                        <Link href={`/events/${event.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(event)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              &ldquo;{toDelete?.title}&rdquo; and all of its registrations will be
              permanently deleted.
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
    </div>
  );
}
