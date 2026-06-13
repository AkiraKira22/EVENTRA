import type { Metadata } from "next";
import { UserTable } from "@/components/dashboard/UserTable";

export const metadata: Metadata = { title: "Manage Users" };

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="mt-1 text-muted-foreground">
          Change user roles or deactivate accounts.
        </p>
      </div>
      <UserTable />
    </div>
  );
}
