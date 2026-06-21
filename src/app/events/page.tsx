import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventsBrowser } from "@/components/events/EventsBrowser";

export const metadata: Metadata = {
  title: "Browse Events",
  description:
    "Browse upcoming workshops, seminars, and community activities and register in one click.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="container flex-1 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Browse Events</h1>
          <p className="mt-1 text-muted-foreground">
            Find activities that match your interests.
          </p>
        </div>
        <EventsBrowser />
      </main>
      <Footer />
    </div>
  );
}
