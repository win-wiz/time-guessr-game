"use client";

import { memo } from "react";
import { MapPin } from "lucide-react";
import { GameProgress } from "@/components/game-progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { SimplePreferences } from "./simple-preferences";
import { GameScore } from "@/lib/local-storage";
import { useRouter } from "next/navigation";

interface GameHeaderProps {
  currentRound: number;
  totalRounds: number;
  scores: GameScore[];
  onSettingsChange?: () => void;
}

export const GameHeader = memo(function GameHeader({
  currentRound,
  totalRounds,
  scores,
  onSettingsChange
}: GameHeaderProps) {

  const router = useRouter();

  return (
    <header className="relative z-50 bg-gradient-to-r from-slate-900/40 via-gray-800/30 to-slate-900/40 backdrop-blur-2xl border-b border-white/10 pointer-events-auto">
      <div className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl border-2 border-blue-400/30">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              CalgaryGuessr
            </h1>
            <div className="text-sm text-blue-200/90">历史时光机</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <GameProgress
            currentRound={currentRound}
            totalRounds={totalRounds}
            scores={scores}
          />
          <SimplePreferences onSettingsChange={onSettingsChange} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
});
