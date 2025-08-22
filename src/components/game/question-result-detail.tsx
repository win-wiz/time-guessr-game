"use client";

import { memo, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// import Image from "next/image";
import { MapPin, Calendar, Award, Navigation, Share2 } from "lucide-react";
import { GameMap } from "@/components/game-map";
import { GameImage } from "../game-image";
import { ShareDialog } from "@/components/ui/share-dialog";
import { GameAPIService, StartGameRequest } from "@/lib/api-service";
import { GameProgressManager, PlayerSettingsManager } from "@/lib/local-storage";

// Animation styles
const fadeInUp = "animate-[fadeInUp_0.6s_ease-out_forwards]";
const slideInLeft = "animate-[slideInLeft_0.8s_ease-out_forwards]";
const slideInRight = "animate-[slideInRight_0.8s_ease-out_forwards]";
const scaleIn = "animate-[scaleIn_0.5s_ease-out_forwards]";
const bounceIn = "animate-[bounceIn_0.7s_ease-out_forwards]";

// Memoized rank color mapping for better performance
const RANK_COLORS = {
  S: 'text-yellow-400',
  A: 'text-green-400',
  B: 'text-blue-400',
  C: 'text-purple-400',
  D: 'text-orange-400',
} as const;

// Memoized achievement icon mapping
const ACHIEVEMENT_ICONS = {
  speed: '⚡',
  perfect: '🎯',
  streak: '🔥',
  exploration: '🔍',
  default: '🏆',
} as const;

// Calculate distance between two points (in kilometers)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Optimized rank color getter
const getRankColor = (rank: string): string => {
  return RANK_COLORS[rank.toUpperCase() as keyof typeof RANK_COLORS] || 'text-gray-400';
};

// Optimized achievement icon getter
const getAchievementIcon = (achievement: string): string => {
  if (achievement.includes('速度') || achievement.includes('快速') || achievement.includes('speed') || achievement.includes('fast')) return ACHIEVEMENT_ICONS.speed;
  if (achievement.includes('完美') || achievement.includes('精确') || achievement.includes('perfect') || achievement.includes('precise')) return ACHIEVEMENT_ICONS.perfect;
  if (achievement.includes('连续') || achievement.includes('streak')) return ACHIEVEMENT_ICONS.streak;
  if (achievement.includes('探索') || achievement.includes('发现') || achievement.includes('exploration') || achievement.includes('discovery')) return ACHIEVEMENT_ICONS.exploration;
  return ACHIEVEMENT_ICONS.default;
};

interface QuestionResultDetailProps {
  questionResult: {
    questionSessionId: string;
    gameSessionId: string;
    questionNumber: number;
    eventId: string;
    guessedYear: number;
    actualYear: number;
    guessedLocation: {
      lat: number;
      lng: number;
    };
    actualLocation: {
      lat: number;
      lng: number;
    };
    answerTime: number;
    score: number;
    scoringDetails: {
      timeScore: number;
      locationScore: number;
      bonusScore: number;
      finalScore: number;
      rank: string;
      achievements: string[];
      streak: number;
      speedBonus: number;
      perfectBonus: number;
      streakBonus: number;
      gameMode: string;
      timeAccuracy: string;
      locationAccuracy: string;
    };
    status: 'completed';
    // 正确的事件详情字段名
    event?: {
      id: string;
      city: string;
      latitude: number;
      longitude: number;
      year: number;
      description?: string;
      imageUrl?: string;
      image_url?: string;
      event_name?: string;
      event_detail?: string;
      event_descript?: string;
      difficulty?: string;
    };
    // 兼容旧版本的字段名
    eventDetails?: {
      description: string;
      imageUrl: string;
      image_url?: string;
      eventName?: string;
      event_name?: string;
      eventDetail?: string;
      event_detail?: string;
      event_descript?: string;
      city?: string;
      country?: string;
      year?: number;
    };
    eventDetail?: {
      id: string;
      city: string;
      latitude: number;
      longitude: number;
      year: number;
      description?: string;
      imageUrl?: string;
      image_url?: string;
      event_name?: string;
      event_detail?: string;
      event_descript?: string;
      difficulty?: string;
    };
  };
  onClose?: () => void;
  onNextQuestion?: () => void;
  hasNextQuestion?: boolean; // Whether there's a next question available
}

export const QuestionResultDetail = memo<QuestionResultDetailProps>(function QuestionResultDetail({ 
  questionResult, 
  onClose,
  onNextQuestion,
  hasNextQuestion = true
}) {
  const router = useRouter();
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [restartProgress, setRestartProgress] = useState(0);
  
  // Handle restart game functionality with progress tracking
  const handleRestartGame = async () => {
    try {
      setIsRestarting(true);
      setRestartProgress(0);
      
      // 1. Clear all game-related localStorage data
      setRestartProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for visual feedback
      GameProgressManager.clearProgress();
      
      // 2. Get player settings for new game initialization
      setRestartProgress(40);
      await new Promise(resolve => setTimeout(resolve, 200));
      const settings = PlayerSettingsManager.loadSettings();
      
      // 3. Call /game/start API to initialize new game
      setRestartProgress(60);
      const startGameRequest: StartGameRequest = {
        gameMode: settings.defaultGameMode,
        questionCount: settings.defaultQuestionCount,
        timeLimit: settings.defaultGameMode === 'timed' ? settings.defaultTimeLimit : undefined
      };
      
      const response = await GameAPIService.startGame(startGameRequest);
      
      // 4. Save new game session to localStorage
      setRestartProgress(80);
      await new Promise(resolve => setTimeout(resolve, 200));
      const newProgress = {
        gameSessionId: response.gameSessionId,
        currentRound: 1,
        totalRounds: response.totalQuestions,
        timeRemaining: startGameRequest.timeLimit || 0,
        eventIds: response.eventIds,
        events: [],
        scores: [],
        questionSessionIds: [],
        startTime: Date.now(),
        lastSaveTime: Date.now(),
        gameMode: response.gameMode as 'timed' | 'untimed',
        timeLimit: response.timeLimit
      };
      
      GameProgressManager.saveProgress(newProgress);
      
      // 5. Redirect to /game page
      setRestartProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/game');
    } catch (error) {
      console.error('Error restarting game:', error);
      setIsRestarting(false);
      setRestartProgress(0);
      alert('Error restarting game. Please try again.');
    }
  };
  
  // Optimized state management - only keep necessary state
  const eventDetails = useMemo(() => {
    return questionResult.event || null;
  }, [questionResult.event]);

  // const hasEventDetails = Boolean(eventDetails);

  // 计算距离 - 使用useMemo缓存计算结果
  const distance = useMemo(() => calculateDistance(
    questionResult.guessedLocation.lat,
    questionResult.guessedLocation.lng,
    questionResult.actualLocation.lat,
    questionResult.actualLocation.lng
  ), [questionResult.guessedLocation, questionResult.actualLocation]);

  // Cache year difference calculation
  const yearDifference = useMemo(() => 
    Math.abs(questionResult.guessedYear - questionResult.actualYear),
    [questionResult.guessedYear, questionResult.actualYear]
  );

  // Cache rank color calculation
  const rankColorClass = useMemo(() => getRankColor(questionResult.scoringDetails.rank), [questionResult.scoringDetails.rank]);

  // Generate share data for ShareDialog
  const shareData = useMemo(() => {
    const eventName = eventDetails?.event_name || 'Historical Event';
    const city = eventDetails?.city || 'Unknown Location';
    const achievements = questionResult.scoringDetails.achievements.length > 0 
      ? questionResult.scoringDetails.achievements.slice(0, 2).join(', ') 
      : 'Great performance';
    
    return {
      title: `Time Guessr Game - Question ${questionResult.questionNumber} Result`,
      description: `I scored ${questionResult.scoringDetails.finalScore} points (Rank ${questionResult.scoringDetails.rank}) guessing "${eventName}" in ${city}! Year accuracy: ±${yearDifference} years, Distance: ${distance.toFixed(1)}km. ${achievements}!`,
      hashtags: ['TimeGuessr', 'HistoryGame', 'Gaming', `Rank${questionResult.scoringDetails.rank}`]
    };
  }, [eventDetails, questionResult, yearDifference, distance]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl pb-20">
      <div className="p-6">
        {/* Optimized title area - more compact layout */}
        <div className={`relative mb-6 ${fadeInUp}`}>
          {/* Main title bar */}
          <div className="bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {/* Left side: Question info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                  {questionResult.questionNumber}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Question Detailed Results</h2>
                  <div className="text-sm text-gray-300">Question {questionResult.questionNumber} Analysis</div>
                </div>
              </div>
              
              {/* Right side: Score card */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Final Score</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {questionResult.scoringDetails.finalScore}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">Rank</div>
                    <div className={`text-xl font-bold ${rankColorClass}`}>
                      {questionResult.scoringDetails.rank}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick stats bar */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-2 text-center border border-blue-500/30">
              <div className="text-xs text-blue-300">Answer Time</div>
              <div className="text-sm font-bold text-white">{questionResult.answerTime}s</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-2 text-center border border-purple-500/30">
              <div className="text-xs text-purple-300">Year Error</div>
              <div className="text-sm font-bold text-white">±{yearDifference}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-2 text-center border border-green-500/30">
              <div className="text-xs text-green-300">Distance</div>
              <div className="text-sm font-bold text-white">{distance.toFixed(0)}km</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-2 text-center border border-yellow-500/30">
              <div className="text-xs text-yellow-300">Streak</div>
              <div className="text-sm font-bold text-white">{questionResult.scoringDetails.streak}</div>
            </div>
          </div>
        </div>

        {/* 核心对比区域 - 图片与地图紧密排列 */}
        <div className="relative mb-8">
          {/* <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            视觉对比分析
          </h3> */}
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* 左侧：图片与事件信息重叠布局 */}
            <div className={`relative group ${slideInLeft} hover-lift glow-effect`}>
              <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-500 group-hover:border-blue-400/50">
                {eventDetails?.image_url ? (
                  <GameImage imageUrl={eventDetails.image_url} eventName={eventDetails.event_name} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className={`text-center ${bounceIn}`}>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400">Loading image...</p>
                    </div>
                  </div>
                )}
                
                {/* 悬浮信息卡片 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-yellow-400 animate-pulse" />
                      <span className="text-xl font-bold text-yellow-400">{questionResult.actualYear}</span>
                      <span className="text-gray-300">Year</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-red-400" />
                      <span className="text-lg font-semibold text-white">{eventDetails?.city || "Unknown Location"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：地图与数据重叠布局 - 响应式高度 */}
            <div className={`relative group ${slideInRight} hover-lift glow-effect`}>
              <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-500 group-hover:border-green-400/50">
                <GameMap
                  guessLocation={questionResult.guessedLocation}
                  actualLocation={questionResult.actualLocation}
                  isGuessing={false}
                  onMapClick={undefined}
                />
                
                {/* 优化的紧凑型城市信息面板 - 左上角 */}
                <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 shadow-lg ${scaleIn} max-w-[150px] sm:max-w-[200px]`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-white truncate">
                        {eventDetails?.city || "Historical Location"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 年份对比面板 - 右上角紧凑布局 */}
                <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 ${scaleIn}`}>
                  <div className="bg-red-500/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-red-400/60 min-w-[60px] sm:min-w-[80px]">
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-red-100 mb-0.5 sm:mb-1">Your Guess</div>
                      <div className="text-sm sm:text-lg font-bold text-white">{questionResult.guessedYear}</div>
                    </div>
                  </div>
                  <div className="bg-green-500/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-green-400/60 min-w-[60px] sm:min-w-[80px]">
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-green-100 mb-0.5 sm:mb-1">Actual Year</div>
                      <div className="text-sm sm:text-lg font-bold text-white">{questionResult.actualYear}</div>
                    </div>
                  </div>
                </div>

                {/* 距离信息面板 - 调整到右侧偏下位置 */}
                <div className={`absolute right-2 sm:right-3 bottom-12 sm:bottom-10 bg-blue-500/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-400/60 ${bounceIn} max-w-[120px] sm:max-w-[160px]`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-400 rounded-full flex items-center justify-center">
                      <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] sm:text-xs text-blue-100">Distance Error</div>
                      <div className="text-sm sm:text-lg font-bold text-white">{distance.toFixed(1)} km</div>
                    </div>
                  </div>
                </div>

                {/* 简化的距离可视化条 - 移到左下角避免与Google标识重叠 */}
                <div className={`absolute bottom-12 sm:bottom-14 left-2 sm:left-3 bg-black/70 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20 ${bounceIn}`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-[140px] sm:min-w-[180px]">
                    <span className="text-[10px] sm:text-xs text-gray-300 whitespace-nowrap">Precise</span>
                    <div className="flex-1 bg-gray-600/80 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-1.5 sm:h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${Math.min((distance / 1000) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-300 whitespace-nowrap">Far</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Information Display Area - Located below image and map */}
        {(eventDetails?.event_detail || eventDetails?.description || eventDetails?.city) && (
          <div className={`mb-8 ${fadeInUp}`}>
            <div className="bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {eventDetails.event_name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {questionResult.actualYear}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Event Description */}
              {(eventDetails?.event_detail || eventDetails?.description) && (
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-200">
                    <span>📖</span>
                    Event Description
                  </h4>
                  <p className="text-gray-200 leading-relaxed">
                    {eventDetails.event_descript || eventDetails.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comprehensive Analysis Area - Integrating all statistical information */}
        <div className={`mb-8 ${fadeInUp}`}>
          <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📊 Comprehensive Analysis Report
          </h3>
          
          {/* Score Breakdown Analysis */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-white/10 mb-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Score Breakdown Details
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{questionResult.scoringDetails.timeScore}</div>
                <div className="text-sm text-gray-400">Time Score</div>
                <div className="text-xs text-gray-500 mt-1">Based on {questionResult.answerTime}s answer</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{questionResult.scoringDetails.locationScore}</div>
                <div className="text-sm text-gray-400">Location Score</div>
                <div className="text-xs text-gray-500 mt-1">Error {distance.toFixed(0)}km</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{questionResult.scoringDetails.bonusScore}</div>
                <div className="text-sm text-gray-400">Bonus Score</div>
                <div className="text-xs text-gray-500 mt-1">Various bonuses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{questionResult.scoringDetails.streak}</div>
                <div className="text-sm text-gray-400">Streak</div>
                <div className="text-xs text-gray-500 mt-1">Consecutive correct</div>
              </div>
            </div>
          </div>

          {/* Achievement and Performance Analysis */}
          {questionResult.scoringDetails.achievements.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 border border-yellow-500/30">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                Achievements Earned ({questionResult.scoringDetails.achievements.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questionResult.scoringDetails.achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-yellow-500/20"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full 
                                  flex items-center justify-center text-lg">
                      {getAchievementIcon(achievement)}
                    </div>
                    <div className="flex-1">
                      <div className="text-yellow-300 font-medium">{achievement}</div>
                      <div className="text-xs text-gray-400">Achievement unlocked</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Floating Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 fixed-bottom-actions bg-gradient-to-t from-black/95 via-black/80 to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {/* Next Question Button - Display based on hasNextQuestion parameter */}
            {hasNextQuestion && (
              <button 
                onClick={() => {
                  if (onNextQuestion) {
                    onNextQuestion();
                  } else {
                    // Fallback: Use page navigation if no callback provided
                    window.location.href = '/game';
                  }
                }}
                className="action-button w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl 
                         transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                         hover:shadow-blue-500/25 flex items-center justify-center gap-3 group
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                <span className="text-lg">➡️</span>
                <span>Next Question</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-pulse"></div>
              </button>
            )}

            {/* Restart Button */}
            <button 
              onClick={() => setShowRestartConfirm(true)}
              className="action-button w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 
                       hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl 
                       transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                       hover:shadow-purple-500/25 flex items-center justify-center gap-3 group
                       focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
            >
              <span className="text-lg">🔄</span>
              <span>Restart</span>
              <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-spin"></div>
            </button>

            {/* Share Results Button */}
            <ShareDialog shareData={shareData}>
              <button className="action-button w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 
                       hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl 
                       transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                       hover:shadow-green-500/25 flex items-center justify-center gap-3 group
                       focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50">
                <Share2 className="w-5 h-5" />
                <span>Share Results</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-bounce"></div>
              </button>
            </ShareDialog>

            {/* Close Button */}
            {onClose && (
              <button 
                onClick={onClose}
                className="action-button w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 
                         hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl 
                         transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                         hover:shadow-gray-500/25 flex items-center justify-center gap-3 group
                         focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                <span className="text-lg">✕</span>
                <span>Close</span>
              </button>
            )}
          </div>

          {/* Quick Action Tips */}
          <div className="mt-3 text-center animate-pulse">
            <p className="text-xs text-gray-400">
              💡 Tip: Buttons are fixed at the bottom for quick access
            </p>
          </div>
        </div>
      </div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              {/* Dialog Header */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              
              {/* Dialog Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {isRestarting ? 'Restarting Game...' : 'Are you sure you want to restart?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {isRestarting 
                    ? 'Please wait while we prepare your new game session.'
                    : 'Your current game progress will be lost and you will start a new game.'
                  }
                </p>
                
                {/* Progress bar */}
                {isRestarting && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{restartProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${restartProgress}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                      {restartProgress <= 20 && 'Clearing game data...'}
                      {restartProgress > 20 && restartProgress <= 40 && 'Loading settings...'}
                      {restartProgress > 40 && restartProgress <= 60 && 'Initializing new game...'}
                      {restartProgress > 60 && restartProgress <= 80 && 'Setting up game session...'}
                      {restartProgress > 80 && restartProgress < 100 && 'Saving progress...'}
                      {restartProgress === 100 && 'Redirecting to game...'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Dialog Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRestartConfirm(false)}
                  disabled={isRestarting}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                           rounded-xl font-medium transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600
                           focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!isRestarting) {
                      handleRestartGame();
                    }
                  }}
                  disabled={isRestarting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white 
                           rounded-xl font-medium transition-all duration-200 hover:from-red-600 hover:to-red-700
                           transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400
                           shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed 
                           disabled:hover:scale-100 disabled:hover:from-red-500 disabled:hover:to-red-600
                           flex items-center justify-center gap-2"
                >
                  {isRestarting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Restarting...</span>
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
