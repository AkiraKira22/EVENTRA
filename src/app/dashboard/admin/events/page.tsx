import type { Metadata } from "next";
import { AdminEventsView } from "@/components/dashboard/AdminEventsView";

export const metadata: Metadata = { title: "Moderate Events" };

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderate Events</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor and manage all events on the platform.
        </p>
      </div>
      <AdminEventsView />
    </div>
  );
}
