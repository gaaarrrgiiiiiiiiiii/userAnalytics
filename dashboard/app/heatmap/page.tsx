"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ClickEvent {
  x: number;
  y: number;
  viewport_width: number;
  viewport_height: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const POLL_MS = 5000;

export default function HeatmapPage() {
  const [pages, setPages]                     = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl]         = useState<string>("");
  const [clicks, setClicks]                   = useState<ClickEvent[]>([]);
  const [isLoadingPages, setIsLoadingPages]   = useState(true);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);
  const [lastRefresh, setLastRefresh]         = useState<Date | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch available pages
  const fetchPages = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/api/pages`, { cache: "no-store" });
      const data = await res.json();
      const newPages: string[] = data.pages || [];
      setPages(newPages);
      setSelectedUrl(prev => prev || (newPages.length > 0 ? newPages[0] : ""));
    } catch {
      // silently ignore
    } finally {
      setIsLoadingPages(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
    const id = setInterval(fetchPages, POLL_MS * 2);
    return () => clearInterval(id);
  }, [fetchPages]);

  // Fetch heatmap clicks
  const fetchClicks = useCallback(async () => {
    if (!selectedUrl) return;
    setIsLoadingHeatmap(true);
    try {
      const res  = await fetch(
        `${API_URL}/api/heatmap?page_url=${encodeURIComponent(selectedUrl)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setClicks(data.clicks || []);
      setLastRefresh(new Date());
    } catch {
      // silently ignore
    } finally {
      setIsLoadingHeatmap(false);
    }
  }, [selectedUrl]);

  useEffect(() => {
    fetchClicks();
    const id = setInterval(fetchClicks, POLL_MS);
    return () => clearInterval(id);
  }, [fetchClicks]);

  // Render heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (clicks.length === 0) return;

    const cW = canvas.width;
    const cH = canvas.height;

    clicks.forEach(click => {
      const vW = click.viewport_width  || 1440;
      const vH = click.viewport_height || 900;

      const x = (click.x / vW) * cW;
      const y = (click.y / vH) * cH;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, 20);
      // Peach/Coral Glow for the heatmap
      glow.addColorStop(0,   "rgba(255, 138, 101, 0.6)"); 
      glow.addColorStop(0.5, "rgba(255, 138, 101, 0.2)");
      glow.addColorStop(1,   "rgba(255, 138, 101, 0)");
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(252, 165, 165, 0.9)"; // slightly lighter coral center
      ctx.fill();
    });
  }, [clicks]);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1C3329] tracking-tight">Heatmap Analysis</h1>
            <p className="mt-1 text-[14px] text-[#4F6B5D]">Visualize spatial interaction density across your tracked pages.</p>
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
              Recording
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-[#FDFBFA] rounded-xl shadow-sm border border-[#EBE1D8] overflow-hidden">
          
          {/* Controls Bar */}
          <div className="px-6 py-4 border-b border-[#EBE1D8] bg-[#FDFBFA] flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <label htmlFor="page_url" className="sr-only">Select Page URL</label>
              {isLoadingPages ? (
                <div className="text-[13px] text-[#4F6B5D] font-medium animate-pulse">Loading tracked pages...</div>
              ) : pages.length === 0 ? (
                <div className="text-[13px] text-[#047857] font-medium bg-[#D1FAE5] px-3 py-1.5 rounded-md border border-[#A7F3D0] inline-block">No pages tracked yet.</div>
              ) : (
                <div className="relative">
                  <select
                    id="page_url"
                    className="block w-full appearance-none rounded-lg border border-[#EBE1D8] bg-[#FAF6F3] py-2 pl-3 pr-10 text-[14px] font-medium text-[#1C3329] focus:border-[#047857] focus:outline-none focus:ring-1 focus:ring-[#047857] transition-colors"
                    value={selectedUrl}
                    onChange={e => setSelectedUrl(e.target.value)}
                  >
                    {pages.map(url => (
                      <option key={url} value={url}>{url}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#769383]">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              )}
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[#1C3329] bg-[#FAF6F3] px-2 py-1 rounded-md border border-[#EBE1D8]">{clicks.length}</span>
              <span className="text-[13px] text-[#4F6B5D] font-medium">interactions</span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="p-6 bg-[#FAF6F3]">
            <div 
              className="relative border border-[#EBE1D8] rounded-xl bg-[#FDFBFA] overflow-hidden shadow-sm flex items-center justify-center"
              style={{ aspectRatio: "16/9" }}
            >
              
              {/* Empty / Loading States */}
              {isLoadingHeatmap && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#FDFBFA]/60 backdrop-blur-[2px]">
                  <div className="flex items-center gap-3 bg-[#FDFBFA] px-5 py-3 rounded-lg shadow-sm border border-[#EBE1D8]">
                    <svg className="animate-spin h-5 w-5 text-[#047857]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-[14px] font-semibold text-[#1C3329]">Rendering heatmap...</span>
                  </div>
                </div>
              )}

              {!isLoadingHeatmap && clicks.length === 0 && selectedUrl && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF6F3] border border-[#EBE1D8]">
                    <svg className="h-5 w-5 text-[#769383]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                    </svg>
                  </div>
                  <h3 className="mt-3 text-[14px] font-semibold text-[#1C3329]">Awaiting Interaction Data</h3>
                  <p className="mt-1 text-[13px] text-[#4F6B5D]">No clicks have been recorded for this page yet.</p>
                </div>
              )}

              {/* Minimal Wireframe Background */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03] p-8 flex flex-col gap-6">
                <div className="h-16 w-full bg-[#1C3329] rounded-lg" />
                <div className="h-64 w-full bg-[#1C3329] rounded-lg" />
                <div className="flex gap-6 flex-1">
                  <div className="h-full w-1/3 bg-[#1C3329] rounded-lg" />
                  <div className="h-full w-1/3 bg-[#1C3329] rounded-lg" />
                  <div className="h-full w-1/3 bg-[#1C3329] rounded-lg" />
                </div>
              </div>

              {/* Heatmap Canvas */}
              <canvas
                ref={canvasRef}
                width={1440}
                height={810}
                className="w-full h-full object-contain relative z-20 mix-blend-multiply opacity-80"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
