import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyEventsList } from "@/components/dashboard/MyEventsList";

export const metadata: Metadata = { title: "My Events" };

export default function MyEventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
          <p className="mt-1 text-muted-foreground">
            Manage the events you organize.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      <MyEventsList />
    </div>
  );
}
