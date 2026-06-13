"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/fetcher";
import { buildQueryString } from "@/lib/utils";
import type { EventDTO, EventFilters } from "@/types";

export function useEvents(filters: EventFilters = {}) {
  const qs = buildQueryString({
    search: filters.search,
    tag: filters.tag,
    scope: filters.scope,
    status: filters.status,
    organizer: filters.organizer,
  });

  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => apiGet<{ events: EventDTO[] }>(`/api/events${qs}`),
    select: (d) => d.events,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => apiGet<{ event: EventDTO }>(`/api/events/${eventId}`),
    select: (d) => d.event,
    enabled: Boolean(eventId),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      apiPost<{ event: EventDTO }>("/api/events", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      apiPatch<{ event: EventDTO }>(`/api/events/${eventId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      apiDelete<{ message: string }>(`/api/events/${eventId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}
