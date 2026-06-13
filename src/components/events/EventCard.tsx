import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { RegistrationStatusBadge } from "@/components/shared/EventStatusBadge";
import { formatEventDate, getInitials, relativeDateLabel } from "@/lib/utils";
import type { EventDTO } from "@/types";

export function EventCard({ event }: { event: EventDTO }) {
  const capacityPct =
    event.capacity != null
      ? Math.min(100, Math.round((event.registrationCount / event.capacity) * 100))
      : null;

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
        {/* Cover */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/20 via-card to-secondary">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CalendarDays className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge className="bg-background/80 text-foreground backdrop-blur">
              {relativeDateLabel(event.date)}
            </Badge>
            {event.myRegistrationStatus &&
              event.myRegistrationStatus !== "CANCELLED" && (
                <RegistrationStatusBadge status={event.myRegistrationStatus} />
              )}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 p-5">
          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="line-clamp-2 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span className="truncate">{formatEventDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Capacity */}
          {event.capacity != null && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.registrationCount}/{event.capacity}
                </span>
                {event.isFull && (
                  <span className="font-medium text-destructive">Full</span>
                )}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Organizer */}
          <div className="flex items-center gap-2 pt-1 text-sm">
            <Avatar className="h-6 w-6">
              {event.organizer.image && (
                <AvatarImage src={event.organizer.image} alt={event.organizer.name} />
              )}
              <AvatarFallback className="text-[10px]">
                {getInitials(event.organizer.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-muted-foreground">
              {event.organizer.name}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
