"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.back()} 
      className="flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors"
    >
      <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs shadow-sm">
        <ChevronLeft className="w-4 h-4 text-white" />
      </span>
      Back
    </button>
  );
}
