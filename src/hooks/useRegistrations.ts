"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/fetcher";
import type { RegistrationDTO, RegistrationStatus } from "@/types";

export function useMyRegistrations() {
  return useQuery({
    queryKey: ["registrations", "me"],
    queryFn: () =>
      apiGet<{ registrations: RegistrationDTO[] }>("/api/registrations"),
    select: (d) => d.registrations,
  });
}

export function useRegisterForEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) =>
      apiPost<{ message: string; status: RegistrationStatus }>(
        `/api/events/${eventId}/register`,
        { notes }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["registrations", "me"] });
    },
  });
}

export function useCancelRegistration(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiDelete<{ message: string }>(`/api/events/${eventId}/register`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["registrations", "me"] });
    },
  });
}

export function useAddToCalendar() {
  return useMutation({
    mutationFn: (eventId: string) =>
      apiPost<{ message: string; htmlLink: string }>("/api/calendar", {
        eventId,
      }),
  });
}
