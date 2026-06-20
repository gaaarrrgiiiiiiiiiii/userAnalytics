"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const mainNav = [
    {
      name: "Overview",
      href: "/",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      ),
    },
    {
      name: "Sessions",
      href: "/sessions",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      name: "Heatmap",
      href: "/heatmap",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex w-[260px] flex-col bg-[#F3EBE5] border-r border-[#E5D5C9] shrink-0 h-full">
      
      {/* Workspace Switcher */}
      <div className="p-4 mb-2">
        <div className="flex w-full items-center justify-between rounded-lg bg-[#FAF6F3] p-2 border border-[#EBE1D8] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-[#047857] to-[#10B981] rounded-md flex items-center justify-center shadow-sm border border-[#047857]/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h4l2-4 3 8 2-6h6" />
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[14px] font-bold text-[#1C3329] leading-tight">Analytics</span>
              <span className="text-[12px] font-medium text-[#4F6B5D] leading-tight">Workspace</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Areas */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Main Dashboards Section */}
        <div className="mb-6">
          <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#769383] mb-2">Dashboards</h3>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    ${isActive
                      ? "bg-[#FDFBFA] text-[#1C3329] shadow-sm border border-[#EBE1D8]"
                      : "text-[#4F6B5D] hover:bg-[#EBE1D8]/50 hover:text-[#1C3329] border border-transparent"
                    }
                    group flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-semibold transition-all duration-200 ease-in-out
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isActive ? "text-[#047857]" : "text-[#769383] group-hover:text-[#047857]"} transition-colors`}>
                      {item.icon}
                    </div>
                    {item.name}
                  </div>
                  {isActive && (
                     <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>
    </div>
  );
}
