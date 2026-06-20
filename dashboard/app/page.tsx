"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Stats {
  total_sessions: number;
  total_events: number;
  page_views: number;
  clicks: number;
  top_pages: { page_url: string; views: number }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const POLL_MS = 5000;

function shortenUrl(url: string) {
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch {
    return url.replace(/^https?:\/\/[^/]+/, "") || url;
  }
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/stats`, { cache: "no-store" });
      if (!res.ok) return;
      const data: Stats = await res.json();
      setStats(data);
      setUpdatedAt(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, POLL_MS);
    return () => clearInterval(id);
  }, [fetchStats]);

  const total = stats?.total_events || 1;
  const viewsPct = stats ? Math.min(100, Math.round((stats.page_views / total) * 100)) : 0;
  const clicksPct = stats ? Math.min(100, Math.round((stats.clicks / total) * 100)) : 0;
  const other = stats ? Math.max(0, stats.total_events - stats.page_views - stats.clicks) : 0;
  const otherPct = Math.max(0, 100 - viewsPct - clicksPct);
  
  const avgPerSess = stats && stats.total_sessions > 0
      ? (stats.total_events / stats.total_sessions).toFixed(1)
      : "0";
      
  const maxViews = stats?.top_pages?.length
      ? Math.max(...stats.top_pages.map((p) => p.views), 1)
      : 1;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1C3329] tracking-tight">Overview</h1>
            <p className="mt-1 text-[14px] text-[#4F6B5D] font-medium">Monitor your key performance metrics.</p>
          </div>
          <div className="flex items-center gap-4 bg-[#FDFBFA] p-2 pr-3 rounded-full border border-[#EBE1D8] shadow-sm">
            {updatedAt && (
              <span className="text-[12px] text-[#769383] font-medium pl-2">
                Updated {updatedAt}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#E6F4EA] text-[#047857]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
              </span>
              Live Tracking
            </span>
          </div>
        </div>

        {/* Hero KPI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Hero Card */}
          <div className="lg:col-span-2 bg-[#FDFBFA] rounded-2xl shadow-sm border border-[#EBE1D8] p-8 flex flex-col justify-center relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-[#FCA5A5] rounded-full blur-[100px] opacity-[0.08] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 right-0 p-8 opacity-10">
               <svg className="w-32 h-32 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
               </svg>
            </div>
            
            <div className="relative z-10 max-w-sm">
              <h2 className="text-[14px] font-bold text-[#769383] uppercase tracking-wider mb-2">
                Total Sessions
              </h2>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-6xl font-extrabold text-[#1C3329] tracking-tighter">
                  {stats?.total_sessions !== undefined ? stats.total_sessions.toLocaleString() : "—"}
                </span>
              </div>
              <p className="text-[14px] font-medium text-[#4F6B5D] leading-relaxed">
                Total unique visits tracked across all properties. This data is updated in real-time as users interact with the application.
              </p>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-rows-3 gap-4 lg:gap-5">
            <div className="bg-[#FDFBFA] rounded-2xl shadow-sm border border-[#EBE1D8] p-6 flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-300">
              <div>
                <p className="text-[13px] font-bold text-[#769383] uppercase tracking-wider">Page Views</p>
                <p className="mt-2 text-3xl font-extrabold text-[#1C3329] tracking-tight">{stats?.page_views !== undefined ? stats.page_views.toLocaleString() : "—"}</p>
              </div>
              <div className="h-12 w-12 bg-[#FAF6F3] rounded-xl flex items-center justify-center text-[#4F6B5D] border border-[#EBE1D8]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-[#FDFBFA] rounded-2xl shadow-sm border border-[#EBE1D8] p-6 flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-300">
              <div>
                <p className="text-[13px] font-bold text-[#769383] uppercase tracking-wider">Total Clicks</p>
                <p className="mt-2 text-3xl font-extrabold text-[#1C3329] tracking-tight">{stats?.clicks !== undefined ? stats.clicks.toLocaleString() : "—"}</p>
              </div>
              <div className="h-12 w-12 bg-[#FAF6F3] rounded-xl flex items-center justify-center text-[#4F6B5D] border border-[#EBE1D8]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                </svg>
              </div>
            </div>

            <div className="bg-[#FDFBFA] rounded-2xl shadow-sm border border-[#EBE1D8] p-6 flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-300">
              <div>
                <p className="text-[13px] font-bold text-[#769383] uppercase tracking-wider">Avg Events / Session</p>
                <p className="mt-2 text-3xl font-extrabold text-[#1C3329] tracking-tight">{avgPerSess}</p>
              </div>
              <div className="h-12 w-12 bg-[#E6F4EA] rounded-xl flex items-center justify-center text-[#047857] border border-[#A7F3D0]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Pages Table */}
          <div className="lg:col-span-2 bg-[#FDFBFA] rounded-2xl shadow-sm border border-[#EBE1D8] overflow-hidden flex flex-col">
            <div className="px-7 py-6 border-b border-[#EBE1D8] flex items-center justify-between bg-[#FAF6F3]">
              <h3 className="text-[16px] font-bold text-[#1C3329] tracking-tight">Top Performing Pages</h3>
              <Link href="/sessions" className="text-[13px] font-bold text-[#047857] hover:text-[#065F46] transition-colors flex items-center gap-1">
                View all sessions 
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            {stats?.top_pages?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#EBE1D8]">
                      <th scope="col" className="px-7 py-4 text-left text-[12px] font-bold text-[#769383] uppercase tracking-wider w-16">#</th>
                      <th scope="col" className="px-7 py-4 text-left text-[12px] font-bold text-[#769383] uppercase tracking-wider">Page URL</th>
                      <th scope="col" className="px-7 py-4 text-right text-[12px] font-bold text-[#769383] uppercase tracking-wider w-24">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF6F3]">
                    {stats.top_pages.slice(0, 8).map((page, i) => {
                      const barPct = (page.views / maxViews) * 100;
                      return (
                        <tr key={page.page_url} className="hover:bg-[#FAF6F3] transition-colors group">
                          <td className="px-7 py-3.5 whitespace-nowrap text-[13px] font-bold text-[#769383]">
                            {String(i + 1).padStart(2, '0')}
                          </td>
                          <td className="px-7 py-3.5 whitespace-nowrap text-[14px] text-[#1C3329] relative">
                            {/* Premium Data Bar behind the text */}
                            <div className="absolute inset-y-2 left-7 right-7 bg-[#FAF6F3] rounded-md overflow-hidden z-0">
                               <div className="h-full bg-[#10B981] opacity-[0.12] transition-all duration-500" style={{ width: `${barPct}%` }} />
                            </div>
                            <div className="relative z-10 py-1 px-3 flex items-center">
                              <p className="font-semibold truncate max-w-sm" title={page.page_url}>
                                {shortenUrl(page.page_url)}
                              </p>
                            </div>
                          </td>
                          <td className="px-7 py-3.5 whitespace-nowrap text-[14px] font-bold text-[#1C3329] text-right">
                            {page.views.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center flex-1 flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-2xl bg-[#FAF6F3] flex items-center justify-center mb-4 border border-[#EBE1D8]">
                  <svg className="h-8 w-8 text-[#769383]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-[15px] font-bold text-[#1C3329]">No page data collected</h3>
                <p className="mt-2 text-[14px] text-[#4F6B5D] max-w-xs">Data will appear here automatically once users visit tracked pages.</p>
              </div>
            )}
          </div>
          
          {/* Right Column: Event Breakdown */}
          <div className="bg-[#FDFBFA] rounded-2xl shadow-sm border border-[#EBE1D8] flex flex-col">
            <div className="px-7 py-6 border-b border-[#EBE1D8] bg-[#FAF6F3]">
              <h3 className="text-[16px] font-bold text-[#1C3329] tracking-tight">Event Breakdown</h3>
            </div>
            
            <div className="p-7 flex-1 flex flex-col justify-center">
              {stats && stats.total_events > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-10">
                    <div className="relative">
                      {/* Donut chart simulation */}
                      <svg className="w-32 h-32 -rotate-90 transform drop-shadow-sm" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle cx="50" cy="50" r="42" fill="transparent" stroke="#EBE1D8" strokeWidth="10" />
                        {/* Page Views Segment */}
                        <circle cx="50" cy="50" r="42" fill="transparent" stroke="#047857" strokeWidth="10" strokeDasharray={`${viewsPct * 2.64} 264`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[12px] font-bold text-[#769383] uppercase tracking-wider mb-0.5">Events</span>
                        <span className="text-2xl font-extrabold text-[#1C3329]">{stats.total_events.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Page Views", val: stats.page_views, pct: viewsPct, color: "bg-[#047857]" },
                      { label: "Clicks", val: stats.clicks, pct: clicksPct, color: "bg-[#FF8A65]" },
                      { label: "Other", val: other, pct: otherPct, color: "bg-[#D4C8BE]" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6F3] border border-[#EBE1D8]/50">
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${row.color} shadow-sm`} />
                          <span className="text-[14px] font-bold text-[#4F6B5D]">{row.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[13px] font-medium text-[#769383]">{row.pct}%</span>
                           <span className="text-[14px] font-extrabold text-[#1C3329] w-12 text-right">{row.val.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-[#769383]">No events recorded yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
