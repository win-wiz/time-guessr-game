"use client";

import { memo, useCallback, useMemo } from "react";
import { Target, Calendar } from "lucide-react";

interface MobileInfoPanelProps {
  eventName: string;
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  guessLocation: { lat: number; lng: number } | null;
  selectedYear: number;
  onYearChange: (year: number) => void;
  currentYear: number;
}

const GameInfoBar = memo(({ 
  eventName, 
  currentRound, 
  totalRounds, 
  timeRemaining, 
  guessLocation 
}: {
  eventName: string;
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  guessLocation: { lat: number; lng: number } | null;
}) => (
  <div className="bg-gradient-to-r from-slate-900/90 via-gray-800/80 to-slate-900/90 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 shadow-xl">
    <div className="flex items-center justify-between text-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center border border-blue-400/40">
          <Target className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold">{eventName}</div>
          <div className="text-xs text-blue-200/80">第 {currentRound}/{totalRounds} 轮</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className={`text-lg font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeRemaining}s
          </div>
        </div>
        <div className={`text-sm ${guessLocation ? 'text-emerald-400' : 'text-gray-400'}`}>
          {guessLocation ? '✓' : '○'}
        </div>
      </div>
    </div>
  </div>
));

GameInfoBar.displayName = "GameInfoBar";

const YearControlBar = memo(({ 
  selectedYear, 
  onYearChange, 
  currentYear 
}: {
  selectedYear: number;
  onYearChange: (year: number) => void;
  currentYear: number;
}) => {
  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onYearChange(parseInt(e.target.value));
  }, [onYearChange]);

  const backgroundStyle = useMemo(() => ({
    WebkitAppearance: 'none' as const,
    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((selectedYear - 1900) / (currentYear - 1900)) * 100}%, #4b5563 ${((selectedYear - 1900) / (currentYear - 1900)) * 100}%, #4b5563 100%)`
  }), [selectedYear, currentYear]);

  return (
    <div className="bg-gradient-to-r from-slate-900/90 via-gray-800/80 to-slate-900/90 backdrop-blur-xl rounded-xl px-4 py-4 border border-white/20 shadow-xl pointer-events-auto">
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">年份</span>
          </div>
          <div className="w-16 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white text-sm font-bold border border-blue-400/40">
            {selectedYear}
          </div>
        </div>
        
        <div className="space-y-2">
          <input
            type="range"
            min={1900}
            max={currentYear}
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full h-3 bg-gray-600/60 rounded-full appearance-none cursor-pointer accent-blue-500 touch-manipulation"
            style={backgroundStyle}
          />
          <div className="flex justify-between text-xs text-gray-300">
            <span>1900</span>
            <span>2024</span>
          </div>
        </div>
      </div>
    </div>
  );
});

YearControlBar.displayName = "YearControlBar";

export const MobileInfoPanel = memo(function MobileInfoPanel({
  eventName,
  currentRound,
  totalRounds,
  timeRemaining,
  guessLocation,
  selectedYear,
  onYearChange,
  currentYear
}: MobileInfoPanelProps) {
  return (
    <div className="md:hidden absolute top-4 left-4 right-4 z-30 space-y-3">
      <GameInfoBar
        eventName={eventName}
        currentRound={currentRound}
        totalRounds={totalRounds}
        timeRemaining={timeRemaining}
        guessLocation={guessLocation}
      />
      <YearControlBar
        selectedYear={selectedYear}
        onYearChange={onYearChange}
        currentYear={currentYear}
      />
    </div>
  );
});