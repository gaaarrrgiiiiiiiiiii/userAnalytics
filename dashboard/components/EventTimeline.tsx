"use client";

import { TrackerEvent } from "../lib/api";

interface Props {
  events: TrackerEvent[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const EVENT_CONFIG = {
  page_view: {
    icon: "📄",
    label: "Page View",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  click: {
    icon: "🖱",
    label: "Click",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
} as const;

export default function EventTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">No events found.</div>
    );
  }

  return (
    <ol className="relative">
      {events.map((ev, i) => {
        const cfg = EVENT_CONFIG[ev.event_type] ?? EVENT_CONFIG.click;
        return (
          <li key={i} className="flex gap-4 pb-6 relative">
            {/* Timeline line */}
            {i < events.length - 1 && (
              <div className="absolute left-[17px] top-8 bottom-0 w-px bg-white/8" />
            )}

            {/* Dot */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${cfg.bg} border ${cfg.border}`}>
              <span className="text-base">{cfg.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {formatTime(ev.timestamp)}
                </span>
                {ev.event_type === "click" && ev.x != null && ev.y != null && (
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400">
                    ({ev.x}, {ev.y})
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 truncate">
                {ev.page_url}
              </p>
              {ev.viewport_width && (
                <p className="text-[11px] text-slate-600 mt-0.5">
                  viewport {ev.viewport_width}×{ev.viewport_height}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
