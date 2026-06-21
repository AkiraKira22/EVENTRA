import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFeatures } from "@/components/home/HomeFeatures";
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

      <main id="main-content" className="flex-1">
        {/* Stacked reveal: each section is a sticky layer that shrinks and
            fades out as the next, higher z-index layer rises up to cover it. */}
        <HomeHero />
        <HomeFeatures />

        {/* Event list — top of the stack (z-20), opaque so it covers the
            features layer as it scrolls up. */}
        <section className="relative z-20 min-h-screen bg-background pb-24">
          <div className="container">
            {/* "Upcoming Events" header pins below the navbar (top-16) so the
                event list scrolls underneath while the header stays on top. */}
            <div className="sticky top-16 z-10 mb-8 flex items-end justify-between gap-4 bg-background py-8">
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
