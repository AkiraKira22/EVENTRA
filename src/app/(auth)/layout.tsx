import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border/60 bg-card/40 p-12 lg:flex">
        <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
        <Link href="/" className="relative flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Event<span className="text-gradient">ra</span>
          </span>
        </Link>

        <div className="relative space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            One platform for all{" "}
            <span className="text-gradient">your events.</span>
          </h2>
          <p className="max-w-md text-muted-foreground">
            Manage registrations, track capacity, and sync to Google Calendar —
            all in one tidy place.
          </p>
        </div>

        <p className="relative text-sm text-muted-foreground">
          © {new Date().getFullYear()} Eventra
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
