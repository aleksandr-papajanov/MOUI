// Base API URL
// Uses Vite env if available, otherwise falls back to localhost
const baseUrl =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() ||
  "http://localhost:5000";

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || res.statusText);
  }

  // Some endpoints return empty body (202 Accepted etc.)
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
