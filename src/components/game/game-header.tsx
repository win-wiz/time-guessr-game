"use client";

import { memo } from "react";
import Image from "next/image";
import { RoundScoreDisplay } from "@/components/game/round-score-display";
import { ThemeToggle } from "@/components/theme-toggle";
import { SimplePreferences } from "./simple-preferences";
import { GameScore } from "@/lib/local-storage";
import { useRouter } from "next/navigation";

interface GameHeaderProps {
  currentRound: number;
  totalRounds: number;
  scores: GameScore[];
  timeRemaining?: number;
  onSettingsChange?: () => void;
}

export const GameHeader = memo(function GameHeader({
  currentRound,
  totalRounds,
  scores,
  timeRemaining,
  onSettingsChange
}: GameHeaderProps) {

  const router = useRouter();

  return (
    <header className="fixed md:static top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/40 via-gray-800/30 to-slate-900/40 backdrop-blur-2xl border-b border-white/10 pointer-events-auto">
      <div className="flex justify-between items-center px-3 sm:px-6 md:px-8 py-3 sm:py-4">
        {/* 左侧Logo区域 - 移动端优化 */}
        <div className="flex items-center gap-2 sm:gap-4 cursor-pointer min-w-0 flex-1" onClick={() => router.push('/')}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="TimeGuessr Logo"
              width={48}
              height={48}
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent truncate">
              TimeGuessr
            </h1>
            {/* 移动端隐藏副标题，节省空间 */}
            <div className="hidden sm:block text-xs md:text-sm text-blue-200/90">History Time</div>
          </div>
        </div>
        
        {/* 右侧控制区域 - 移动端优化 */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          <RoundScoreDisplay
            currentRound={currentRound}
            totalRounds={totalRounds}
            scores={scores}
            variant="compact"
            showProgress={true}
            className="hidden md:flex"
          />
          {/* 移动端显示简化版本的轮次信息和时间 */}
          <div className="flex md:hidden items-center gap-2 text-white">
            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-xs font-bold">{currentRound}</span>
            </div>
            <span className="text-xs font-medium">{currentRound}/{totalRounds}</span>
            {timeRemaining !== undefined && (
              <div className="text-xs font-medium text-white bg-red-500/20 px-2 py-1 rounded">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
          {/* <SimplePreferences onSettingsChange={onSettingsChange} /> */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
});
