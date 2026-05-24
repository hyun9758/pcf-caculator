"use client";

import { useViewMode } from "@/contexts/ViewModeContext";
import { cn } from "@/lib/utils";
import { Briefcase, Wrench } from "lucide-react";

export function ViewToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => setViewMode("executive")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          viewMode === "executive"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <Briefcase className="h-4 w-4" />
        경영자
      </button>
      <button
        onClick={() => setViewMode("practitioner")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          viewMode === "practitioner"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <Wrench className="h-4 w-4" />
        실무자
      </button>
    </div>
  );
}
