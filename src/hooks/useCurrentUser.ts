"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@/types";

/** Wrapper useSession dengan helper role yang sudah diketik. */
export function useCurrentUser() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const role: Role | undefined = user?.role;

  return {
    user,
    role,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: role === "ADMIN",
    isOrganizer: role === "ORGANIZER" || role === "ADMIN",
    canCreateEvents: role === "ORGANIZER" || role === "ADMIN",
  };
}
