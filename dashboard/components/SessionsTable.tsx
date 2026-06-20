"use client";

import { Session } from "../lib/api";
import Link from "next/link";

interface Props {
  sessions: Session[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(first: string, last: string) {
  const ms = new Date(last).getTime() - new Date(first).getTime();
  if (ms < 1000) return "<1s";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export default function SessionsTable({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-slate-400 font-medium">No sessions yet</p>
        <p className="text-slate-500 text-sm mt-1">
          Open <code className="text-indigo-400">demo.html</code> in a browser to generate events.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-white/[0.03]">
            <th className="text-left py-3 px-5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Session ID</th>
            <th className="text-right py-3 px-5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Events</th>
            <th className="text-left py-3 px-5 text-slate-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">First Seen</th>
            <th className="text-left py-3 px-5 text-slate-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Last Seen</th>
            <th className="text-right py-3 px-5 text-slate-400 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Duration</th>
            <th className="py-3 px-5"></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr
              key={s.session_id}
              className="border-b border-white/5 hover:bg-white/[0.025] transition-colors group"
            >
              <td className="py-3.5 px-5">
                <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                  {s.session_id.slice(0, 8)}…
                </span>
              </td>
              <td className="py-3.5 px-5 text-right">
                <span className="font-bold text-white">{s.event_count}</span>
              </td>
              <td className="py-3.5 px-5 text-slate-400 hidden md:table-cell text-xs">
                {formatTime(s.first_seen)}
              </td>
              <td className="py-3.5 px-5 text-slate-400 hidden md:table-cell text-xs">
                {formatTime(s.last_seen)}
              </td>
              <td className="py-3.5 px-5 text-right hidden sm:table-cell">
                <span className="text-xs text-emerald-400 font-semibold">
                  {duration(s.first_seen, s.last_seen)}
                </span>
              </td>
              <td className="py-3.5 px-5 text-right">
                <Link
                  href={`/sessions/${s.session_id}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
