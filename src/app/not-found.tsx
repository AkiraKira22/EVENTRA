import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Compass className="h-8 w-8" />
      </span>
      <div className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for could not be found.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
