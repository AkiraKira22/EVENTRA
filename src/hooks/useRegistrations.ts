"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/fetcher";
import { buildQueryString } from "@/lib/utils";
import type {
  EventRegistrationDTO,
  Pagination,
  RegistrationDTO,
  RegistrationStatus,
} from "@/types";

type RegPage = { registrations: RegistrationDTO[]; pagination: Pagination };

export function useMyRegistrations() {
  return useInfiniteQuery({
    queryKey: ["registrations", "me"],
    queryFn: ({ pageParam }) =>
      apiGet<RegPage>(`/api/registrations?page=${pageParam}&limit=12`),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.page + 1 : undefined,
  });
}

/** Attendees of a single event (organizer view), optionally filtered by status. */
export function useEventRegistrations(eventId: string, status?: string) {
  const qs = buildQueryString({ status });
  return useQuery({
    queryKey: ["event-registrations", eventId, status ?? "active"],
    queryFn: () =>
      apiGet<{ registrations: EventRegistrationDTO[]; pagination: Pagination }>(
        `/api/events/${eventId}/registrations${qs}`
      ),
    select: (d) => d.registrations,
    enabled: Boolean(eventId),
  });
}

/** Approve or reject a registration (organizer/admin). */
export function useUpdateRegistration(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      registrationId: string;
      action: "approve" | "reject";
    }) =>
      apiPatch<{ message: string; status: RegistrationStatus }>(
        `/api/registrations/${vars.registrationId}`,
        { action: vars.action }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event-registrations", eventId] });
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      apiPost<{ message: string; htmlLink: string }>("/api/calendar", {
        eventId,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["registrations", "me"] }),
  });
}

export function useRemoveFromCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      apiDelete<{ message: string }>("/api/calendar", { eventId }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["registrations", "me"] }),
  });
}
