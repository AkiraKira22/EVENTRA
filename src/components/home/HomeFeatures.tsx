"use client";

import { CalendarCheck, CalendarPlus, ShieldCheck } from "lucide-react";
import { useScrollFadeOut } from "@/hooks/useScrollFadeOut";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "One-Click Registration",
    desc: "Fast sign-up with real-time status and automatic waitlisting when an event is full.",
  },
  {
    icon: CalendarPlus,
    title: "Google Calendar Sync",
    desc: "Events you join go straight into your calendar, complete with reminders.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Roles & Access",
    desc: "Admin, Organizer, and Attendee roles with layered access control.",
  },
];

export function HomeFeatures() {
  // Sits above the hero (z-10) and, like the hero, fills the screen and fades
  // out across the second screen (index 1) as the event list covers it.
  const innerRef = useScrollFadeOut<HTMLDivElement>(1);

  return (
    <section className="sticky top-0 z-10 flex h-screen items-center overflow-hidden bg-background">
      <div
        ref={innerRef}
        className="container grid gap-6 will-change-transform sm:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-border/60 bg-card/40 p-6 transition hover:border-primary/30"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
