"use client";

import { useState } from "react";
import { Check, Loader2, Users, X } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { RegistrationStatusBadge } from "@/components/shared/EventStatusBadge";
import {
  useEventRegistrations,
  useUpdateRegistration,
} from "@/hooks/useRegistrations";
import { getInitials, formatShortDate } from "@/lib/utils";

const TABS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "WAITLISTED", label: "Waitlist" },
  { value: "ALL", label: "All" },
];

export function EventRegistrationsManager({ eventId }: { eventId: string }) {
  const [tab, setTab] = useState("PENDING");
  const status = tab === "ALL" ? undefined : tab;
  const { data: regs, isLoading } = useEventRegistrations(eventId, status);
  const update = useUpdateRegistration(eventId);

  function decide(registrationId: string, action: "approve" | "reject") {
    update.mutate(
      { registrationId, action },
      {
        onSuccess: (res) => toast.success(res.message),
        onError: (e) => toast.error((e as Error).message),
      }
    );
  }

  return (
    <div className="space-y-5">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !regs || regs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No registrations"
          description="No attendees with this status yet."
        />
      ) : (
        <div className="space-y-3">
          {regs.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-9 w-9">
                  {r.user?.image && (
                    <AvatarImage src={r.user.image} alt={r.user.name} />
                  )}
                  <AvatarFallback>{getInitials(r.user?.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {r.user?.name ?? "Unknown user"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.user?.email}
                  </p>
                  {r.notes && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      &ldquo;{r.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <RegistrationStatusBadge status={r.status} />
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {formatShortDate(r.registeredAt)}
                </span>
                {r.status !== "CONFIRMED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decide(r.id, "approve")}
                    disabled={update.isPending}
                  >
                    <Check className="h-4 w-4" />
                    {r.status === "WAITLISTED" ? "Promote" : "Approve"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => decide(r.id, "reject")}
                  disabled={update.isPending}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
