const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

type ApiOptions = RequestInit & { token?: string };

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed with ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const authApi = {
  register: (data: { email: string; full_name: string; password: string }) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: (token: string) => apiFetch("/auth/me", { token }),
};

export const tripsApi = {
  list: (token: string) => apiFetch("/trips", { token }),
  create: (token: string, data: unknown) =>
    apiFetch("/trips", { method: "POST", token, body: JSON.stringify(data) }),
  get: (token: string, id: number) => apiFetch(`/trips/${id}`, { token }),
  update: (token: string, id: number, data: unknown) =>
    apiFetch(`/trips/${id}`, { method: "PATCH", token, body: JSON.stringify(data) }),
  remove: (token: string, id: number) =>
    apiFetch(`/trips/${id}`, { method: "DELETE", token }),
};

export type ItineraryRequest = {
  origin?: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  travelers?: number;
  budget?: number;
  currency?: string;
  travel_style?: string;
  interests?: string[];
  preferences?: string;
  trip_id?: number;
};

export type ItineraryResponse = {
  provider: string;
  model: string;
  itinerary: Record<string, unknown>;
};

export const aiApi = {
  generateItinerary: (token: string, data: ItineraryRequest) =>
    apiFetch<ItineraryResponse>("/ai/itinerary", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
};
