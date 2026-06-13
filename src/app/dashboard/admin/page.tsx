import type { Metadata } from "next";
import { AdminStatsView } from "@/components/dashboard/AdminStatsView";

export const metadata: Metadata = { title: "Admin Statistics" };

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Statistics</h1>
        <p className="mt-1 text-muted-foreground">
          An overview of platform activity.
        </p>
      </div>
      <AdminStatsView />
    </div>
  );
}
