"use client";

import { useState, useEffect } from "react";
import { GameMap } from "@/components/game-map";
import { GameControls } from "@/components/game-controls";
import { GameProgress } from "@/components/game-progress";
import { GameResults } from "@/components/game-results";
import { GameImage } from "@/components/game-image";
import { calculateScore, calculateDistance } from "@/lib/game-utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, Target, Calendar, Maximize2, Minimize2, Play, Pause, RotateCcw, Zap } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import { ThemeToggle } from "@/components/theme-toggle";
import { fetchEventsFromAPI, TimeGuessrEvent, submitGuessToAPI, UserGuess, VerificationResult } from "@/lib/data-service";

const currentYear = new Date().getFullYear();

export default function Game() {
  const router = useRouter();
  const [events, setEvents] = useState<TimeGuessrEvent[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [currentEvent, setCurrentEvent] = useState<TimeGuessrEvent | null>(null);
  const [guessLocation, setGuessLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [gameState, setGameState] = useState<
    "guessing" | "results" | "summary"
  >("guessing");
  const [scores, setScores] = useState<
    Array<{
      score: number;
      distance: number;
      yearDifference: number;
      event: TimeGuessrEvent;
      guessedYear: number;
      actualLat: number;
      actualLng: number;
    }>
  >([]);
  const [timeRemaining, setTimeRemaining] = useState(60000);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    // 获取事件数据
    fetchEventsFromAPI(5)
      .then(data => {
        // console.log('Fetched events:', data);
        setEvents(data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        // 如果API调用失败，可以显示错误信息给用户
      });
  }, []);

  useEffect(() => {
    if (events.length > 0 && currentRound <= events.length) {
      const event = events[currentRound - 1];
      setCurrentEvent(event);
      setSelectedYear(2000); // 重置年份选择
    }
  }, [currentRound, events]);

  useEffect(() => {
    if (gameState === "guessing" && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "guessing" && timeRemaining === 0) {
      handleSubmitGuess();
    }
  }, [timeRemaining, gameState]);

  const handleMapClick = (lat: number, lng: number) => {
    if (gameState === "guessing") {
      setGuessLocation({ lat, lng });
    }
  };

  const handleSubmitGuess = async () => {
    if (!currentEvent) return;

    if (!guessLocation) {
      // User made no guess → 0 points
      setScores([
        ...scores,
        { 
          score: 0, 
          distance: 0, 
          yearDifference: Math.abs(selectedYear - currentEvent.year),
          event: currentEvent, 
          guessedYear: selectedYear,
          actualLat: currentEvent.latitude,
          actualLng: currentEvent.longitude
        },
      ]);
      setGameState("results");
      return;
    }

    try {
      // 提交猜测到后台进行验证
      const guess: UserGuess = {
        eventId: currentEvent.id,
        guessedLat: guessLocation.lat,
        guessedLng: guessLocation.lng,
        guessedYear: selectedYear
      };

      const result: VerificationResult = await submitGuessToAPI(guess);
      
      setScores([...scores, { 
        score: result.score, 
        distance: result.distance,
        yearDifference: result.yearDifference,
        event: currentEvent, 
        guessedYear: selectedYear,
        actualLat: result.actualLat,
        actualLng: result.actualLng
      }]);
    } catch (error) {
      console.error('Error submitting guess:', error);
      // 如果API调用失败，使用本地计算作为备选
      const distance = calculateDistance(
        guessLocation.lat,
        guessLocation.lng,
        currentEvent.latitude,
        currentEvent.longitude
      );
      const yearDifference = Math.abs(selectedYear - currentEvent.year);
      const yearBonus = Math.max(0, 100 - yearDifference * 5);
      const locationScore = calculateScore(distance);
      const totalScore = Math.round(locationScore + yearBonus);
      
      setScores([...scores, { 
        score: totalScore, 
        distance,
        yearDifference,
        event: currentEvent, 
        guessedYear: selectedYear,
        actualLat: currentEvent.latitude,
        actualLng: currentEvent.longitude
      }]);
    }

    setGameState("results");
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setGuessLocation(null);
      setGameState("guessing");
      setTimeRemaining(60);
    } else {
      setGameState("summary");
    }
  };

  const handlePlayAgain = () => {
    setCurrentRound(1);
    setScores([]);
    setGuessLocation(null);
    setSelectedYear(2000);
    setGameState("guessing");
    setTimeRemaining(60);
    // 重新获取事件数据
    fetchEventsFromAPI(5)
      .then(data => setEvents(data))
      .catch(error => console.error('Error fetching events:', error));
  };

  const totalScore = scores.reduce((sum, round) => sum + round.score, 0);

  return (
    <main className="h-screen bg-black text-white flex flex-col overflow-hidden relative">
      {
        currentEvent && (
          <div 
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{ backgroundImage: `url(${currentEvent?.image_url})` 
                  , backgroundSize: 'cover' 
                  , backgroundRepeat: 'no-repeat' 
                  , filter: 'blur(5px)' 
              }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/25 pointer-events-none"></div>
          </div>
        )
      }
                 

      {/* 顶部浮动状态栏 - 中性优雅风格 */}
      <header className="relative z-50 bg-gradient-to-r from-slate-900/40 via-gray-800/30 to-slate-900/40 backdrop-blur-2xl border-b border-white/10 pointer-events-auto">
        <div className="flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-4">
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
          
          <div className="flex items-center gap-8">
            <GameProgress
              currentRound={currentRound}
              totalRounds={totalRounds}
              scores={scores}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {gameState === "guessing" && currentEvent && (
        <div className="relative z-10 pointer-events-none flex-1">
          {/* 中央图片区域 - 标红区域 */}
          <div className="absolute w-1/2 left-1/2 top-20 transform -translate-x-1/2 z-20 pointer-events-auto" style={{ height: 'calc(100% - 400px)' }}>
            <GameImage 
              imageUrl={currentEvent.image_url} 
              eventName={currentEvent.event_name}
            />
          </div>

          {/* 左上角游戏提示 - 优化位置 */}
          <div className="absolute top-6 left-6 z-30">
            <div className="bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 shadow-xl max-w-sm">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center border border-blue-400/40 flex-shrink-0">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{currentEvent.event_name}</div>
                  <div className="text-xs text-blue-200/80">观察细节推测地点和时间 • 第 {currentRound}/{totalRounds} 轮</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右上角状态信息 - 紧凑布局 */}
          <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
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
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600/60 rounded-full appearance-none cursor-pointer accent-blue-500 mb-2"
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

          {/* 浮动地图区域 - 浮在图片上方 */}
          <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-auto" data-map-container>
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl relative isolate">
              {/* 提交按钮移到地图内部 */}
              <div className="flex justify-center absolute left-1/2 transform -translate-x-1/2 -top-[28px]">
                <button
                  onClick={handleSubmitGuess}
                  disabled={!guessLocation}
                  className={`group relative px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 shadow-xl border-2 ${
                    guessLocation 
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-600 text-white border-blue-400/50 transform hover:scale-105' 
                      : 'bg-gray-700/60 text-gray-400 border-gray-600/40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    {guessLocation ? '🎯 提交猜测' : '请先选择位置'}
                  </div>
                  
                  {guessLocation && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-indigo-600/20 animate-pulse"></div>
                  )}
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center border border-blue-400/40">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    在地图上标记位置
                  </h3>
                  
                  <div className="flex items-center gap-3">
                    {guessLocation && (
                      <div className="bg-emerald-600/30 border border-emerald-500/60 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                        ✓ 位置已标记
                      </div>
                    )}
                    
                    <button
                      onClick={() => setIsMapExpanded(!isMapExpanded)}
                      className="p-2 bg-gray-700/60 hover:bg-gray-600/70 rounded-full transition-colors border border-gray-600/40"
                    >
                      {isMapExpanded ? <Minimize2 className="w-4 h-4 text-gray-200" /> : <Maximize2 className="w-4 h-4 text-gray-200" />}
                    </button>
                  </div>
                </div>
                
                <div className={`rounded-xl overflow-hidden border border-white/10 shadow-xl transition-all duration-500 ${
                  isMapExpanded ? 'h-[500px]' : 'h-32'
                }`}>
                  <GameMap
                    onMapClick={handleMapClick}
                    guessLocation={guessLocation}
                    actualLocation={null}
                    isGuessing={true}
                  />
                </div>
              </div>
            </div>
          </div>



          {/* 移动端适配 */}
          <div className="lg:hidden absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col z-40">
            {/* 移动端顶部 */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{currentEvent.event_name}</h3>
                  <p className="text-sm opacity-90">第 {currentRound} / {totalRounds} 轮</p>
                </div>
                <div className={`text-right ${timeRemaining <= 10 ? 'animate-pulse' : ''}`}>
                  <div className="text-2xl font-bold">{timeRemaining}s</div>
                </div>
              </div>
            </div>

            {/* 移动端图片预览 */}
            <div className="h-40 bg-gray-800 relative overflow-hidden">
              <img 
                src={currentEvent.image_url} 
                alt={currentEvent.event_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-3 text-white">
                  <p className="text-sm font-medium">观察图片细节，推测事件发生的地点和年份</p>
                </div>
              </div>
            </div>

            {/* 移动端地图 */}
            <div className="flex-1 relative">
              <GameMap
                onMapClick={handleMapClick}
                guessLocation={guessLocation}
                actualLocation={null}
                isGuessing={true}
              />
              {guessLocation && (
                <div className="absolute top-2 right-2 bg-green-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                  位置已选择
                </div>
              )}
            </div>

            {/* 移动端控制面板 */}
            <div className="bg-black/95 backdrop-blur-sm p-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-white font-medium">年份: {selectedYear}</label>
                </div>
                <input
                  type="range"
                  min={1900}
                  max={2024}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1900</span>
                  <span>2024</span>
                </div>
              </div>
              
              <button
                onClick={handleSubmitGuess}
                disabled={!guessLocation}
                className={`w-full py-4 rounded-2xl text-lg font-bold ${
                  guessLocation 
                    ? 'bg-gradient-to-r from-green-500 to-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {guessLocation ? '🎯 提交猜测' : '请先选择位置'}
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "results" &&
        currentEvent &&
        currentRound <= totalRounds && (
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
                      lat: scores[scores.length - 1]?.actualLat || currentEvent.latitude,
                      lng: scores[scores.length - 1]?.actualLng || currentEvent.longitude
                    }}
                    score={scores[scores.length - 1]?.score || 0}
                    distance={scores[scores.length - 1]?.distance || 0}
                    onNextRound={handleNextRound}
                    isLastRound={currentRound === totalRounds}
                    guessedYear={scores[scores.length - 1]?.guessedYear}
                    actualYear={currentEvent.year}
                  />
                </div>
                
                <div className="bg-gradient-to-r from-slate-900/50 via-gray-800/40 to-slate-900/50 p-6 flex justify-center border-t border-white/20">
                  <button
                    onClick={handleNextRound}
                    className="px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800 hover:from-blue-500 hover:via-purple-600 hover:to-indigo-700 text-white text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-400/40"
                  >
                    {currentRound === totalRounds ? '🏆 查看总结' : '➡️ 下一轮'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {gameState === "summary" && (
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
                          <div className="text-gray-300 mb-3">📍 距离误差</div>
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
                          <div className="text-gray-300 mb-3">📅 年份误差</div>
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
                  onClick={handlePlayAgain}
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
      )}
    </main>
  );
}