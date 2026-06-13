import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { getUpcomingEvents } from "@/lib/events-data";

// ISR: regenerate every 60s so featured events don't freeze at build time.
export const revalidate = 60;

export default async function HomePage() {
  const featured = await getUpcomingEvents(6);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-grid-pattern [background-size:40px_40px] opacity-40" />
          <div className="absolute left-1/2 top-0 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

          <div className="container flex flex-col items-center py-24 text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              A modern event registration platform
            </span>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              Find &amp; register for your{" "}
              <span className="text-gradient">favorite events</span> in seconds
            </h1>

            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Browse workshops, seminars, and community activities. Register in one
              click, then sync straight to Google Calendar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/events">
                  Browse Events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Create a Free Account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container grid gap-6 py-16 sm:grid-cols-3">
          {[
            {
              icon: CalendarCheck,
              title: "One-Click Registration",
              desc: "Fast sign-up with real-time status and automatic waitlisting when an event is full.",
            },
            {
              icon: CalendarPlus,
              title: "Google Calendar Sync",
              desc: "Events you join go straight into your calendar, complete with reminders.",
            },
            {
              icon: ShieldCheck,
              title: "Secure Roles & Access",
              desc: "Admin, Organizer, and Attendee roles with layered access control.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border/60 bg-card/40 p-6 transition hover:border-primary/30"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        {/* Featured events */}
        <section className="container pb-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Upcoming Events</h2>
              <p className="mt-1 text-muted-foreground">
                Don&apos;t miss the next great activity.
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/events">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="No events yet"
              description="Published events will show up here. Connect your database and create your first event."
              action={
                <Button asChild>
                  <Link href="/events/new">Create Event</Link>
                </Button>
              }
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
