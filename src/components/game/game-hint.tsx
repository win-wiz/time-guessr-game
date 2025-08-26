"use client";

import { memo, useMemo } from "react";
import { Target } from "lucide-react";

interface GameHintProps {
  eventName: string;
  currentRound: number;
  totalRounds: number;
}

export const GameHint = memo(function GameHint({
  eventName,
  currentRound,
  totalRounds
}: GameHintProps) {
  // Memoize the hint text to prevent unnecessary re-renders
  const hintText = useMemo(() => 
    `Observe details to deduce event location and time • Round ${currentRound}/${totalRounds}`,
    [currentRound, totalRounds]
  );

  return (
    <div className="hidden md:block absolute top-6 left-6 z-30 opacity-95">
      <div className="bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 shadow-xl max-w-sm">
        <div className="flex items-center gap-3 text-white/90">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center border border-blue-400/40 flex-shrink-0">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{eventName}</div>
            <div className="text-xs text-blue-200/80">
              {hintText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});