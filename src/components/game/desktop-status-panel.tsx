"use client";

import { memo, useCallback, useMemo } from "react";
import { Clock, Calendar, MapPin } from "lucide-react";
import { currentMaxYear } from "@/lib/utils";

interface DesktopStatusPanelProps {
  timeRemaining: number;
  selectedYear: number;
  onYearChange: (year: number) => void;
  guessLocation: { lat: number; lng: number } | null;
  currentYear: number;
}

// Time and location status panel component
export const DesktopStatusPanel = memo(function DesktopStatusPanel({ 
  timeRemaining, 
  guessLocation
}: Pick<DesktopStatusPanelProps, 'timeRemaining' | 'guessLocation'>) {
  // Memoize time display class to prevent unnecessary re-renders
  const timeDisplayClass = useMemo(() => 
    `text-lg font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`,
    [timeRemaining]
  );

  // Memoize location status text and class
  const locationStatus = useMemo(() => ({
    text: guessLocation ? 'Marked' : 'Not Selected',
    className: `text-sm font-bold ${guessLocation ? 'text-emerald-400' : 'text-gray-400'}`
  }), [guessLocation]);

  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl pointer-events-auto">
      <div className="flex items-center justify-between">
        {/* Time information */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border border-orange-400/40">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className={timeDisplayClass}>
              {Math.max(0, timeRemaining)}s
            </div>
            <div className="text-xs text-gray-300">Time Remaining</div>
          </div>
        </div>

        {/* Location status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg border border-emerald-400/40">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className={locationStatus.className}>
              {locationStatus.text}
            </div>
            <div className="text-xs text-gray-300">Map Location</div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Year selector component
export const YearSelector = memo(function YearSelector({ 
  selectedYear, 
  onYearChange, 
  currentYear
}: Pick<DesktopStatusPanelProps, 'selectedYear' | 'onYearChange' | 'currentYear'>) {
  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onYearChange(parseInt(e.target.value));
  }, [onYearChange]);

  // Memoize progress percentage to avoid recalculation
  const progressPercentage = useMemo(() => 
    ((selectedYear - 1900) / (currentYear - 1900)) * 100,
    [selectedYear, currentYear]
  );

  const backgroundStyle = useMemo(() => ({
    WebkitAppearance: 'none' as const,
    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, #4b5563 ${progressPercentage}%, #4b5563 100%)`
  }), [progressPercentage]);

  // Memoize year range labels
  const yearRangeLabels = useMemo(() => ({
    min: 1900,
    max: currentMaxYear
  }), []);

  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl pointer-events-auto">
      <div className="flex items-center gap-4">
        {/* Year label and display */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-400/40">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-lg font-bold text-white">{selectedYear}</div>
            <div className="text-xs text-gray-300">Select Year</div>
          </div>
        </div>
        
        {/* Slider area */}
        <div className="flex-1">
          <input
            type="range"
            min={yearRangeLabels.min}
            max={currentYear}
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full h-2 bg-gray-600/60 rounded-full appearance-none cursor-pointer accent-blue-500 mb-1"
            style={backgroundStyle}
          />
          <div className="flex justify-between text-xs text-gray-300">
            <span>{yearRangeLabels.min}</span>
            <span>{yearRangeLabels.max}</span>
          </div>
        </div>
      </div>
    </div>
  );
});