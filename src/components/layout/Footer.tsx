import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>
            Event<span className="text-primary">ra</span> · Event Registration System
          </span>
        </div>
        <nav className="flex items-center gap-5">
          <Link href="/events" className="transition hover:text-foreground">
            Browse
          </Link>
          <Link href="/login" className="transition hover:text-foreground">
            Sign In
          </Link>
          <span>© {new Date().getFullYear()}</span>
        </nav>
      </div>
    </footer>
  );
}
