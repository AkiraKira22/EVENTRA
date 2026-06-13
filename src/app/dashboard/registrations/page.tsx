import type { Metadata } from "next";
import { MyRegistrationsList } from "@/components/dashboard/MyRegistrationsList";

export const metadata: Metadata = { title: "My Registrations" };

export default function RegistrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Registrations</h1>
        <p className="mt-1 text-muted-foreground">
          All the events you&apos;ve joined, along with their status.
        </p>
      </div>
      <MyRegistrationsList />
    </div>
  );
}
