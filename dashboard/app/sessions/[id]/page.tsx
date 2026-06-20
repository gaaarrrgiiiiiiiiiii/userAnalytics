import Link from "next/link";

interface Event {
  event_type: string;
  page_url: string;
  timestamp: string;
  x?: number;
  y?: number;
  viewport_width?: number;
  viewport_height?: number;
}

interface SessionData {
  session_id: string;
  events: Event[];
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  let sessionData: SessionData | null = null;
  let error = null;

  try {
    const res = await fetch(`${apiUrl}/api/sessions/${id}`, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch session details (Status: ${res.status})`);
    }
    sessionData = await res.json();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
        
        <div className="mb-8">
          <Link href="/sessions" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#769383] hover:text-[#1C3329] transition-colors mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Sessions
          </Link>
          
          <div className="border-b border-[#EBE1D8] pb-5">
            <h3 className="text-xl font-semibold leading-6 text-[#1C3329]">Session Journey</h3>
            <p className="mt-2 text-[13px] text-[#4F6B5D] font-mono bg-[#FAF6F3] inline-block px-2 py-1 rounded-md border border-[#EBE1D8]">
              {id}
            </p>
          </div>
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 shadow-sm">
            <p className="font-semibold text-[14px]">Error loading session</p>
            <p className="text-[13px] mt-1 opacity-90">{error}</p>
          </div>
        ) : !sessionData || sessionData.events.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-[#EBE1D8] bg-[#FDFBFA] shadow-sm">
            <p className="text-[14px] text-[#4F6B5D] font-medium">No events found for this session.</p>
          </div>
        ) : (
          <div className="bg-[#FDFBFA] rounded-xl shadow-sm border border-[#EBE1D8] p-6 sm:p-8 relative">
            {/* Subtle background decoration */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#FCA5A5] rounded-full blur-3xl opacity-10 -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flow-root relative z-10">
              <ul role="list" className="-mb-8">
                {sessionData.events.map((event, eventIdx) => (
                  <li key={eventIdx}>
                    <div className="relative pb-8">
                      {eventIdx !== sessionData.events.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-[#EBE1D8]" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-4">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-[#FDFBFA] shadow-sm ${event.event_type === 'page_view' ? 'bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0]' : 'bg-[#FAF6F3] text-[#769383] border border-[#EBE1D8]'}`}>
                            {event.event_type === 'page_view' ? (
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L6.56 10l1.72-1.72zm4.5-1.06a.75.75 0 10-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-[14px] font-semibold text-[#1C3329]">
                              {event.event_type === 'page_view' ? 'Viewed ' : 'Clicked on '}
                              <a href={event.page_url} target="_blank" rel="noopener" className="font-semibold text-[#047857] hover:text-[#065F46] truncate inline-block max-w-[200px] sm:max-w-md align-bottom transition-colors">
                                {event.page_url}
                              </a>
                            </p>
                            {event.event_type === 'click' && event.x !== null && event.y !== null && (
                              <p className="mt-1 text-[12px] text-[#4F6B5D] font-medium">
                                Coordinates: ({event.x}, {event.y})
                              </p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-[12px] font-medium text-[#769383]">
                            <time dateTime={event.timestamp}>{new Date(event.timestamp).toLocaleTimeString()}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
