"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Session {
  session_id: string;
  event_count: number;
  first_seen: string;
  last_seen: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const POLL_MS = 5000; // refresh every 5 seconds

export default function SessionsPage() {
  const [sessions, setSessions]     = useState<Session[]>([]);
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data: Session[] = await res.json();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1C3329] tracking-tight">Session Explorer</h1>
            <p className="mt-1 text-[14px] text-[#4F6B5D]">Analyze individual user journeys and interaction sequences.</p>
          </div>
          <div className="flex items-center gap-4">
            {lastRefresh && (
              <span className="text-[13px] text-[#4F6B5D] font-medium">
                Last updated at {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold bg-[#FDFBFA] border border-[#EBE1D8] shadow-sm text-[#1C3329]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
              </span>
              Live Tracking
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#4F6B5D] font-medium bg-[#FDFBFA] rounded-xl border border-[#EBE1D8] shadow-sm">
            <svg className="mx-auto h-6 w-6 text-[#047857] animate-spin mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading sessions...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 shadow-sm">
            <p className="font-semibold text-[14px]">Error loading sessions</p>
            <p className="text-[13px] mt-1 opacity-90">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-[#EBE1D8] bg-[#FDFBFA] shadow-sm flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-[#FAF6F3] flex items-center justify-center mb-4 border border-[#EBE1D8]">
              <svg className="h-5 w-5 text-[#769383]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
              </svg>
            </div>
            <h3 className="text-[14px] font-semibold text-[#1C3329]">No sessions recorded</h3>
            <p className="mt-1 text-[13px] text-[#4F6B5D]">Waiting for user interactions.</p>
          </div>
        ) : (
          <div className="bg-[#FDFBFA] rounded-xl shadow-sm border border-[#EBE1D8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#EBE1D8]">
                <thead className="bg-[#FAF6F3]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-[12px] font-semibold text-[#769383] uppercase tracking-wider">
                      Session ID
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-[12px] font-semibold text-[#769383] uppercase tracking-wider">
                      Engagement
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-[12px] font-semibold text-[#769383] uppercase tracking-wider">
                      First Seen
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-[12px] font-semibold text-[#769383] uppercase tracking-wider">
                      Last Seen
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right text-[12px] font-semibold text-[#769383] uppercase tracking-wider">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#FDFBFA] divide-y divide-[#FAF6F3]">
                  {sessions.map((session) => (
                    <tr
                      key={session.session_id}
                      className="hover:bg-[#FAF6F3] transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#1C3329]">
                        <span className="font-mono text-[12px] text-[#4F6B5D] bg-[#FAF6F3] px-2 py-1 rounded-md border border-[#EBE1D8]">{session.session_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#4F6B5D]">
                        <span className="inline-flex items-center rounded-md bg-[#D1FAE5] px-2.5 py-1 text-[12px] font-semibold text-[#047857] ring-1 ring-inset ring-[#A7F3D0]">
                          {session.event_count} events
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#4F6B5D] font-medium">
                        {new Date(session.first_seen).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#4F6B5D] font-medium">
                        {new Date(session.last_seen).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-[13px] font-semibold">
                        <Link
                          href={`/sessions/${session.session_id}`}
                          className="text-[#047857] hover:text-[#065F46] transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          View timeline &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
