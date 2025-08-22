"use client";

import { memo } from "react";
import Link from "next/link";
import { TimeGuessrEvent } from "@/lib/data-service";

interface GameSummaryPageProps {
  totalRounds: number;
  totalScore: number;
  scores: Array<{
    score: number;
    distance: number;
    yearDifference: number;
    event: TimeGuessrEvent;
    guessedYear: number;
    actualLat: number;
    actualLng: number;
  }>;
  onPlayAgain: () => void;
}

export const GameSummaryPage = memo(function GameSummaryPage({
  totalRounds,
  totalScore,
  scores,
  onPlayAgain
}: GameSummaryPageProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-6 overflow-auto relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900/70 via-gray-800/60 to-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 p-12 text-white text-center border-b border-white/20">
            <h2 className="text-5xl font-bold mb-6 text-white">🏆 游戏结束!</h2>
            <div className="text-8xl font-bold mb-6 bg-gradient-to-r from-blue-300 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
              {totalScore}
            </div>
            <p className="text-blue-200 text-xl">你完成了所有 {totalRounds} 轮挑战</p>
          </div>
          
          <div className="p-8">
            <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-4">
              <span className="text-4xl">📊</span>
              详细成绩
            </h3>
            
            <div className="grid gap-6 max-h-96 overflow-y-auto">
              {scores.map((round, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-xl">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xl">{round.event.event_name}</p>
                        <p className="text-blue-200 text-lg">{round.event.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-white">{round.score}</div>
                      <div className="text-gray-300">分数</div>
                    </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-2xl text-center">
                      <div className="text-gray-300 mb-3">📍 Distance Error</div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {round.distance.toFixed(1)} km
                      </div>
                      <span className={`text-sm px-4 py-2 rounded-full ${
                        round.distance <= 10 
                          ? 'bg-green-500/20 text-green-400' 
                          : round.distance <= 50
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {round.distance <= 10 ? '🎯 精确' : round.distance <= 50 ? '👍 不错' : '📍 较远'}
                      </span>
                    </div>
                    
                    <div className="bg-white/5 p-6 rounded-2xl text-center">
                      <div className="text-gray-300 mb-3">📅 Year Error</div>
                      <div className="text-2xl font-bold text-white mb-2">
                        {round.yearDifference} 年
                      </div>
                      <span className={`text-sm px-4 py-2 rounded-full ${
                        round.yearDifference <= 5 
                          ? 'bg-green-500/20 text-green-400' 
                          : round.yearDifference <= 15
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {round.yearDifference <= 5 ? '🎯 精确' : round.yearDifference <= 15 ? '📅 接近' : '⏰ 较远'}
                      </span>
                      <div className="text-gray-400 mt-2">
                        {round.guessedYear} / {round.event.year}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-slate-900/50 via-gray-800/40 to-slate-900/50 p-8 flex justify-center gap-8 border-t border-white/20">
            <button
              onClick={onPlayAgain}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-400/40"
            >
              🔄 再玩一次
            </button>
            
            <Link href="/" className="px-10 py-4 bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-600 hover:to-slate-700 text-white text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-500/40">
              🏠 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});