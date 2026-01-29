// src/api/http.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      // Keep JSON request bodies working
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  // Helpful for debugging
  console.log(
    "API",
    init.method ?? "GET",
    path,
    res.status,
    res.headers.get("content-type"),
  );

  if (!res.ok) {
    // Try to get a useful error body (JSON ProblemDetails OR plain text)
    const ct = res.headers.get("content-type") ?? "";
    const msg = ct.includes("application/json")
      ? JSON.stringify(await res.json())
      : await res.text();

    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }

  // No content
  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") ?? "";

  // JSON responses
  if (ct.includes("application/json") || ct.includes("+json")) {
    return (await res.json()) as T;
  }

  // Text responses (your POST /api/optimization/request returns text/plain)
  return (await res.text()) as unknown as T;
}
