"use client";

import { memo, useCallback } from "react";
import { MapPin, Maximize2, Minimize2 } from "lucide-react";
import { GameMap } from "@/components/game-map";
import { YearControlBar } from "@/components/game/mobile-info-panel";

interface MapContainerProps {
  onMapClick: (lat: number, lng: number) => void;
  guessLocation: { lat: number; lng: number } | null;
  isMapExpanded: boolean;
  onToggleExpanded: () => void;
  // 移动端年份选择器相关props
  selectedYear?: number;
  onYearChange?: (year: number) => void;
  currentYear?: number;
  isMobile?: boolean;
}

export const MapContainer = memo(function MapContainer({
  onMapClick,
  guessLocation,
  // isMapExpanded,
  onToggleExpanded,
  // selectedYear,
  // onYearChange,
  // currentYear,
  // isMobile = false
}: MapContainerProps) {
  // const handleToggleExpanded = useCallback(() => {
  //   onToggleExpanded();
  // }, [onToggleExpanded]);

  return (
    <div className="w-full pointer-events-auto" data-map-container>
      <div className="relative">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center border border-emerald-400/40 shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">Map Location</h3>
                <p className="text-white/60 text-sm">Tap to mark your guess</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {guessLocation && (
                <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 px-3 py-1.5 rounded-xl text-sm font-medium backdrop-blur-sm shadow-lg">
                  ✓ Marked
                </div>
              )}
            </div>
          </div>
          
          <div className="rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/20 backdrop-blur-sm transition-all duration-500 h-[250px] md:h-[350px] lg:h-[425px]">
            <GameMap
              onMapClick={onMapClick}
              guessLocation={guessLocation}
              actualLocation={null}
              isGuessing={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
});