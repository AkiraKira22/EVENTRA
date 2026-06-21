import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EventRegistrationsManager } from "@/components/dashboard/EventRegistrationsManager";
import { getEventById } from "@/lib/events-data";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Manage Registrations",
  robots: { index: false, follow: false },
};

export default async function ManageEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/events/${params.eventId}/manage`);
  }

  const event = await getEventById(params.eventId);
  if (!event) notFound();

  const isOwner = event.organizer.id === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") {
    redirect(`/events/${params.eventId}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="container flex-1 py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/events/${event.id}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to event
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
            <p className="mt-1 text-muted-foreground">
              Approve, promote, or reject attendees for &ldquo;{event.title}&rdquo;.
            </p>
          </div>
          <EventRegistrationsManager eventId={event.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
