import { Navbar } from "@/components/layout/Navbar";
import { EventGridSkeleton } from "@/components/events/EventGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container flex flex-col items-center gap-4 py-24 text-center">
          <Skeleton className="h-8 w-72 rounded-full" />
          <Skeleton className="h-14 w-full max-w-2xl" />
          <Skeleton className="h-5 w-80" />
          <Skeleton className="mt-4 h-12 w-48" />
        </section>
        <section className="container pb-24">
          <EventGridSkeleton />
        </section>
      </main>
    </div>
  );
}
