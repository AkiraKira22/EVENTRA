import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventForm } from "@/components/events/EventForm";
import { getEventById } from "@/lib/events-data";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit Event" };

export default async function EditEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect(`/login?callbackUrl=/events/${params.eventId}/edit`);

  const event = await getEventById(params.eventId);
  if (!event) notFound();

  // Owner or admin only.
  const isOwner = event.organizer.id === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") {
    redirect(`/events/${params.eventId}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container flex-1 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
            <p className="mt-1 text-muted-foreground">
              Update the details for &ldquo;{event.title}&rdquo;.
            </p>
          </div>
          <EventForm event={event} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
