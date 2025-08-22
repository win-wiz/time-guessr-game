"use client";

import { memo } from "react";
import { GameResults } from "@/components/game-results";
import { TimeGuessrEvent } from "@/lib/data-service";

interface GameResultsPageProps {
  currentEvent: TimeGuessrEvent;
  currentRound: number;
  totalRounds: number;
  guessLocation: { lat: number; lng: number } | null;
  scores: Array<{
    score: number;
    distance: number;
    yearDifference: number;
    event: TimeGuessrEvent;
    guessedYear: number;
    actualLat: number;
    actualLng: number;
  }>;
  onNextRound: () => void;
}

export const GameResultsPage = memo(function GameResultsPage({
  currentEvent,
  currentRound,
  totalRounds,
  guessLocation,
  scores,
  onNextRound
}: GameResultsPageProps) {
  const currentScore = scores[scores.length - 1];

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-6 overflow-auto relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900/70 via-gray-800/60 to-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 p-8 text-white text-center border-b border-white/20">
            <h2 className="text-4xl font-bold mb-2 text-white">🎯 回合结果</h2>
            <p className="text-blue-200 text-lg">第 {currentRound} / {totalRounds} 轮</p>
          </div>
          
          <div className="p-8">
            <GameResults
              guessLocation={guessLocation || { lat: 0, lng: 0 }}
              actualLocation={{
                lat: currentScore?.actualLat || currentEvent.latitude || 0,
                lng: currentScore?.actualLng || currentEvent.longitude || 0
              }}
              score={currentScore?.score || 0}
              distance={currentScore?.distance || 0}
              onNextRound={onNextRound}
              isLastRound={currentRound === totalRounds}
              guessedYear={currentScore?.guessedYear}
              actualYear={currentEvent.year}
            />
          </div>
          
          <div className="bg-gradient-to-r from-slate-900/50 via-gray-800/40 to-slate-900/50 p-6 flex justify-center border-t border-white/20">
            <button
              onClick={onNextRound}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800 hover:from-blue-500 hover:via-purple-600 hover:to-indigo-700 text-white text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-400/40"
            >
              {currentRound === totalRounds ? '🏆 View Summary' : '➡️ Next Round'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});