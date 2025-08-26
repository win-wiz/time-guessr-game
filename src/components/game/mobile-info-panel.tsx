"use client";

import { memo, useCallback, useMemo } from "react";
import { Target, Calendar } from "lucide-react";
import { currentMaxYear } from "@/lib/utils";

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
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeDisplayClass = useMemo(() =>
    `text-xl font-bold font-mono ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`,
    [timeRemaining]
  );

  const locationStatus = useMemo(() => ({
    text: guessLocation ? '📍 Location marked' : '🗺️ Select location',
    className: `text-sm font-medium ${guessLocation ? 'text-emerald-400' : 'text-amber-400'}`
  }), [guessLocation]);

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between text-white mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center border border-blue-400/40 shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-semibold">Round {currentRound}</div>
            <div className="text-sm text-blue-200/70">of {totalRounds}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={timeDisplayClass}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs text-white/60">remaining</div>
        </div>
      </div>
      
      <div className="mb-3">
        <h2 className="text-white text-lg font-semibold leading-tight line-clamp-2">
          {eventName}
        </h2>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
          guessLocation ? 'bg-emerald-400 shadow-emerald-400/50 shadow-lg' : 'bg-amber-400 shadow-amber-400/50 shadow-lg'
        }`}></div>
        <span className={locationStatus.className}>
          {locationStatus.text}
        </span>
      </div>
    </div>
  );
});

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

  const yearRangeLabels = useMemo(() => ({
    min: '1900',
    max: currentMaxYear.toString()
  }), []);

  const sliderProps = useMemo(() => ({
    min: 1900,
    max: currentYear,
    value: selectedYear
  }), [currentYear, selectedYear]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center border border-purple-400/40 shadow-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-base">Year</div>
            <div className="text-white/60 text-sm">Select time period</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-4 py-2 border border-blue-400/40 shadow-lg">
          <div className="text-white text-xl font-bold font-mono">{selectedYear}</div>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="range"
          min={sliderProps.min}
          max={sliderProps.max}
          value={sliderProps.value}
          onChange={handleYearChange}
          className="w-full h-4 bg-gray-600/60 rounded-full appearance-none cursor-pointer accent-blue-500 touch-manipulation slider-thumb"
          style={backgroundStyle}
        />
        <div className="flex justify-between text-sm text-white/70 font-medium">
          <span>{yearRangeLabels.min}</span>
          <span>{yearRangeLabels.max}</span>
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
    <GameInfoBar
      eventName={eventName}
      currentRound={currentRound}
      totalRounds={totalRounds}
      timeRemaining={timeRemaining}
      guessLocation={guessLocation}
    />
  );
});

// 导出年份控制栏供其他组件使用
export { YearControlBar };