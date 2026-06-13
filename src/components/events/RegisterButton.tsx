"use client";

import { useRouter } from "next/navigation";
import { CalendarPlus, Check, Loader2, LogIn, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  useRegisterForEvent,
  useCancelRegistration,
  useAddToCalendar,
} from "@/hooks/useRegistrations";
import { isEventPast } from "@/lib/utils";
import type { EventDTO } from "@/types";

export function RegisterButton({ event }: { event: EventDTO }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useCurrentUser();
  const register = useRegisterForEvent(event.id);
  const cancel = useCancelRegistration(event.id);
  const calendar = useAddToCalendar();

  const status = event.myRegistrationStatus;
  const isRegistered =
    status === "CONFIRMED" || status === "PENDING" || status === "WAITLISTED";
  const past = isEventPast(event.date);

  if (isLoading) {
    return (
      <Button size="lg" disabled className="w-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        size="lg"
        className="w-full"
        onClick={() =>
          router.push(`/login?callbackUrl=/events/${event.id}`)
        }
      >
        <LogIn className="h-4 w-4" />
        Sign in to register
      </Button>
    );
  }

  if (past) {
    return (
      <Button size="lg" disabled className="w-full">
        Event has ended
      </Button>
    );
  }

  if (event.status !== "PUBLISHED") {
    return (
      <Button size="lg" disabled className="w-full">
        Registration not open yet
      </Button>
    );
  }

  function handleRegister() {
    register.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(res.message);
        router.refresh();
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  function handleCancel() {
    cancel.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(res.message);
        router.refresh();
      },
      onError: (e) => toast.error((e as Error).message),
    });
  }

  function handleCalendar() {
    toast.promise(calendar.mutateAsync(event.id), {
      loading: "Adding to Google Calendar…",
      success: "Added to Google Calendar 🎉",
      error: (e) => (e as Error).message,
    });
  }

  if (isRegistered) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-400">
          <Check className="h-4 w-4" />
          {status === "WAITLISTED"
            ? "You're on the waitlist"
            : status === "PENDING"
              ? "Awaiting approval"
              : "You're registered"}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCalendar}
            disabled={calendar.isPending}
          >
            <CalendarPlus className="h-4 w-4" />
            Add to Calendar
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleCancel}
            disabled={cancel.isPending}
          >
            {cancel.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleRegister}
      disabled={register.isPending}
    >
      {register.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : event.isFull ? (
        "Join waitlist"
      ) : (
        "Register Now"
      )}
    </Button>
  );
}
