const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ────────────────────────────────────────────────────────────────── //
export interface Session {
  session_id: string;
  event_count: number;
  first_seen: string;
  last_seen: string;
}

export interface TrackerEvent {
  event_type: "page_view" | "click";
  page_url: string;
  timestamp: string;
  x: number | null;
  y: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
}

export interface SessionDetail {
  session_id: string;
  events: TrackerEvent[];
}

export interface ClickPoint {
  x: number;
  y: number;
  viewport_width: number;
  viewport_height: number;
}

export interface HeatmapData {
  page_url: string;
  click_count: number;
  clicks: ClickPoint[];
}

// ── Fetch helpers ─────────────────────────────────────────────────────────── //
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    // No-store so dashboard always shows fresh data
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────── //
export const api = {
  /** List all sessions with event counts */
  getSessions: () => apiFetch<Session[]>("/api/sessions"),

  /** Ordered events for one session (user journey) */
  getSession: (sessionId: string) =>
    apiFetch<SessionDetail>(`/api/sessions/${sessionId}`),

  /** Click data for heatmap */
  getHeatmap: (pageUrl: string) =>
    apiFetch<HeatmapData>(`/api/heatmap?page_url=${encodeURIComponent(pageUrl)}`),

  /** Unique pages with click data (for heatmap dropdown) */
  getPages: () => apiFetch<{ pages: string[] }>("/api/pages"),
};
