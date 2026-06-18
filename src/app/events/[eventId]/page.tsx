import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { RegisterButton } from "@/components/events/RegisterButton";
import { EventStatusBadge } from "@/components/shared/EventStatusBadge";
import { getEventById } from "@/lib/events-data";
import { formatEventDate, getInitials } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { eventId: string };
}): Promise<Metadata> {
  const event = await getEventById(params.eventId);
  return { title: event?.title ?? "Event" };
}

export default async function EventDetailPage({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getEventById(params.eventId);
  if (!event) notFound();

  const spotsLeft =
    event.capacity != null ? event.capacity - event.registrationCount : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Cover */}
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-card to-secondary sm:h-80">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CalendarDays className="h-16 w-16 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="container -mt-16 pb-20">
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: "Home", href: "/" },
              { label: "Events", href: "/events" },
              { label: event.title },
            ]}
          />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <EventStatusBadge status={event.status} />
                  {event.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {event.title}
                </h1>
              </div>

              {event.description && (
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              )}

              <Card>
                <CardContent className="flex items-center gap-3 p-5">
                  <Avatar className="h-11 w-11">
                    {event.organizer.image && (
                      <AvatarImage
                        src={event.organizer.image}
                        alt={event.organizer.name}
                      />
                    )}
                    <AvatarFallback>
                      {getInitials(event.organizer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground">Organizer</p>
                    <p className="font-medium">{event.organizer.name}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="space-y-5 p-6">
                  <div className="space-y-3 text-sm">
                    <InfoRow icon={CalendarDays} label="Date & Time">
                      {formatEventDate(event.date)}
                    </InfoRow>
                    {event.endDate && (
                      <InfoRow icon={Clock} label="Ends">
                        {formatEventDate(event.endDate)}
                      </InfoRow>
                    )}
                    <InfoRow icon={MapPin} label="Location">
                      {event.locationUrl ? (
                        <a
                          href={event.locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {event.location}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        event.location
                      )}
                    </InfoRow>
                    <InfoRow icon={Users} label="Attendees">
                      {event.registrationCount}
                      {event.capacity != null && ` / ${event.capacity}`}
                      {spotsLeft != null && spotsLeft > 0 && (
                        <span className="ml-1 text-muted-foreground">
                          ({spotsLeft} spots left)
                        </span>
                      )}
                    </InfoRow>
                  </div>

                  <RegisterButton event={event} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{children}</p>
      </div>
    </div>
  );
}
