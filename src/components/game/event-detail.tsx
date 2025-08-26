"use client";

import { useState } from "react";

interface EventDetailProps {
  eventDetail: string;
  className?: string;
  maxLines?: number;
  expandThreshold?: number;
}

export function EventDetailPanel({ 
  eventDetail, 
  className = "", 
  maxLines = 3, 
  // expandThreshold = 150 
}: EventDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl opacity-95 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold flex items-center gap-2 text-white">
          <span>📖</span>
          Event Details
        </h4>
      </div>
      <p className={`text-white/90 leading-relaxed transition-all duration-300 ${
        isExpanded ? 'max-h-none' : `line-clamp-${maxLines} overflow-hidden`
      }`}>
        {eventDetail}
      </p>
    </div>
  );
}