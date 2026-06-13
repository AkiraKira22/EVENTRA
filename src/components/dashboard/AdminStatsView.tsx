"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck,
  CalendarDays,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { apiGet } from "@/lib/fetcher";
import type { AdminStats, Role } from "@/types";

export function AdminStatsView() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => apiGet<{ stats: AdminStats }>("/api/admin/stats"),
    select: (d) => d.stats,
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Users" value={data.totalUsers} icon={Users} />
        <StatsCard
          label="Total Events"
          value={data.totalEvents}
          icon={CalendarDays}
          hint={`${data.publishedEvents} published`}
        />
        <StatsCard
          label="Total Registrations"
          value={data.totalRegistrations}
          icon={CalendarCheck}
        />
        <StatsCard
          label="Registrations Today"
          value={data.registrationsToday}
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 font-semibold">User Role Distribution</h3>
          <div className="space-y-3">
            {(Object.keys(data.usersByRole) as Role[]).map((role) => {
              const count = data.usersByRole[role];
              const pct = data.totalUsers
                ? Math.round((count / data.totalUsers) * 100)
                : 0;
              return (
                <div key={role} className="flex items-center gap-3">
                  <div className="w-32">
                    <RoleBadge role={role} />
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm text-muted-foreground">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
