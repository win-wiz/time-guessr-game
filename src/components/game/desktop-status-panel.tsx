"use client";

import { memo, useCallback, useMemo } from "react";
import { Clock, Calendar, MapPin } from "lucide-react";

interface DesktopStatusPanelProps {
  timeRemaining: number;
  selectedYear: number;
  onYearChange: (year: number) => void;
  guessLocation: { lat: number; lng: number } | null;
  currentYear: number;
}

export const DesktopStatusPanel = memo(function DesktopStatusPanel({ 
  timeRemaining, 
  selectedYear, 
  onYearChange, 
  guessLocation,
  currentYear
}: DesktopStatusPanelProps) {
  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onYearChange(parseInt(e.target.value));
  }, [onYearChange]);

  const backgroundStyle = useMemo(() => ({
    WebkitAppearance: 'none' as const,
    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((selectedYear - 1900) / (currentYear - 1900)) * 100}%, #4b5563 ${((selectedYear - 1900) / (currentYear - 1900)) * 100}%, #4b5563 100%)`
  }), [selectedYear, currentYear]);

  return (
    <div className="hidden md:flex absolute top-6 right-6 z-30 flex-col gap-3">
      {/* 时间倒计时 */}
      <div className="bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 shadow-xl">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="text-right">
            <div className={`text-lg font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {timeRemaining}s
            </div>
            <div className="text-xs text-gray-300">剩余时间</div>
          </div>
        </div>
      </div>

      {/* 年份选择器 - 紧凑版 */}
      <div className="bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl pointer-events-auto">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-white">年份</span>
          </div>
          
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-xl mx-auto mb-3 border-2 border-blue-400/40">
            <div className="text-lg font-bold text-white">{selectedYear}</div>
          </div>
          
          <input
            type="range"
            min={1900}
            max={currentYear}
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full h-3 bg-gray-600/60 rounded-full appearance-none cursor-pointer accent-blue-500 mb-2"
            style={backgroundStyle}
          />
          
          <div className="flex justify-between text-xs text-gray-300">
            <span>1900</span>
            <span>2024</span>
          </div>
        </div>
      </div>

      {/* 位置状态指示 */}
      <div className="bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 shadow-xl">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div className="text-right">
            <div className={`text-sm font-bold ${guessLocation ? 'text-emerald-400' : 'text-gray-400'}`}>
              {guessLocation ? '已标记' : '未选择'}
            </div>
            <div className="text-xs text-gray-300">地图位置</div>
          </div>
        </div>
      </div>
    </div>
  );
});