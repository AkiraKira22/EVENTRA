"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/fetcher";
import { buildQueryString } from "@/lib/utils";
import type { EventDTO, EventFilters, Pagination } from "@/types";

type EventsPage = { events: EventDTO[]; pagination: Pagination };

/** Paginated "load more" event list, used by the public browse page. */
export function useInfiniteEvents(filters: EventFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["events", "infinite", filters],
    queryFn: ({ pageParam }) =>
      apiGet<EventsPage>(
        `/api/events${buildQueryString({
          search: filters.search,
          tag: filters.tag,
          scope: filters.scope,
          status: filters.status,
          organizer: filters.organizer,
          page: pageParam,
          limit: 12,
        })}`
      ),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.page + 1 : undefined,
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
