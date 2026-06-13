// Client-side fetch helpers for use with TanStack Query.
// Always throws an Error carrying the server message so it can be shown in a toast.

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }

  return data as T;
}

export const apiGet = <T>(url: string) => apiFetch<T>(url);

export const apiPost = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const apiPatch = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined });

export const apiDelete = <T>(url: string) =>
  apiFetch<T>(url, { method: "DELETE" });
