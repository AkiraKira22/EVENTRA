import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

/** Safely merge Tailwind classNames (dedupe conflicts). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an event date: "Sat, 25 Oct 2025 · 19:00" */
export function formatEventDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEE, d MMM yyyy · HH:mm");
}

/** Short date format: "25 Oct 2025" */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy");
}

/** Friendly relative label: "Today", "Tomorrow", or a time distance. */
export function relativeDateLabel(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isPast(d)) return `${formatDistanceToNow(d)} ago`;
  return `in ${formatDistanceToNow(d)}`;
}

/** True if the event is in the past. */
export function isEventPast(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return isPast(d);
}

/** Get initials from a name for an avatar fallback. */
export function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Truncate text with an ellipsis. */
export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

/** Build a query string from a filter object (ignores empty values). */
export function buildQueryString(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}
