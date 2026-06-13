import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventForm } from "@/components/events/EventForm";

export const metadata: Metadata = { title: "Create Event" };

export default function NewEventPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create a New Event</h1>
            <p className="mt-1 text-muted-foreground">
              Fill in the event details. &ldquo;Published&rdquo; status makes it
              visible to the public immediately.
            </p>
          </div>
          <EventForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
