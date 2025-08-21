"use client";

import { memo, useCallback } from "react";
import { MapPin, Maximize2, Minimize2 } from "lucide-react";
import { GameMap } from "@/components/game-map";

interface MapContainerProps {
  onMapClick: (lat: number, lng: number) => void;
  guessLocation: { lat: number; lng: number } | null;
  isMapExpanded: boolean;
  onToggleExpanded: () => void;
}

export const MapContainer = memo(function MapContainer({
  onMapClick,
  guessLocation,
  isMapExpanded,
  onToggleExpanded
}: MapContainerProps) {
  const handleToggleExpanded = useCallback(() => {
    onToggleExpanded();
  }, [onToggleExpanded]);

  return (
    <div className="w-full pointer-events-auto" data-map-container>
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl relative isolate">
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="text-sm md:text-lg font-bold text-white flex items-center gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center border border-blue-400/40">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <span className="hidden md:inline">在地图上标记位置</span>
              <span className="md:hidden">标记位置</span>
            </h3>
            
            <div className="flex items-center gap-2 md:gap-3">
              {guessLocation && (
                <div className="bg-emerald-600/30 border border-emerald-500/60 text-emerald-300 px-2 py-1 rounded-full text-xs font-medium">
                  ✓ 已标记
                </div>
              )}
              
              <button
                onClick={handleToggleExpanded}
                className="p-1.5 md:p-2 bg-gray-700/60 hover:bg-gray-600/70 rounded-full transition-colors border border-gray-600/40"
              >
                {isMapExpanded ? <Minimize2 className="w-3 h-3 md:w-4 md:h-4 text-gray-200" /> : <Maximize2 className="w-3 h-3 md:w-4 md:h-4 text-gray-200" />}
              </button>
            </div>
          </div>
          
          <div className={`rounded-xl overflow-hidden border border-white/10 shadow-xl transition-all duration-500 ${
            isMapExpanded ? 'h-[300px] md:h-[500px]' : 'h-24 md:h-32'
          }`}>
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