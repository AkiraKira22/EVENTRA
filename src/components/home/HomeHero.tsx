"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollFadeOut } from "@/hooks/useScrollFadeOut";

export function HomeHero() {
  // Fills the screen and fades out across the first screen of scroll (index 0).
  // -mt-16 pulls it under the (translucent) navbar so it truly fills the page.
  const innerRef = useScrollFadeOut<HTMLDivElement>(0);

  return (
    <section className="sticky top-0 z-0 -mt-16 flex h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid-pattern [background-size:40px_40px] opacity-40" />
      <div className="absolute left-1/2 top-0 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div
        ref={innerRef}
        className="container flex flex-col items-center text-center will-change-transform"
      >
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
          <Sparkles className="h-4 w-4 text-primary" />
          A modern event registration platform
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Find &amp; register for your{" "}
          <span className="text-gradient">favorite events</span> in seconds
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Browse workshops, seminars, and community activities. Register in one
          click, then sync straight to Google Calendar.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/events">
              Browse Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">Create a Free Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
