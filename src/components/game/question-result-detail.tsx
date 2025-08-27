"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Award, Navigation, Share2 } from "lucide-react";
import { GameMap } from "@/components/game-map";
import { GameImage } from "../game-image";
import { ShareDialog } from "@/components/ui/share-dialog";
import { GameAPIService, StartGameRequest } from "@/lib/api-service";
import { GameProgressManager, PlayerSettingsManager } from "@/lib/local-storage";

// Animation styles - moved outside component for better performance
const ANIMATION_CLASSES = {
  fadeInUp: "animate-[fadeInUp_0.6s_ease-out_forwards]",
  slideInLeft: "animate-[slideInLeft_0.8s_ease-out_forwards]",
  slideInRight: "animate-[slideInRight_0.8s_ease-out_forwards]",
  scaleIn: "animate-[scaleIn_0.5s_ease-out_forwards]",
  bounceIn: "animate-[bounceIn_0.7s_ease-out_forwards]"
} as const;

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

// Common style classes for better performance
const COMMON_STYLES = {
  statCard: 'backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center transition-all duration-200',
  statCardHover: 'hover:bg-opacity-30',
  statLabel: 'text-[10px] sm:text-xs mb-1',
  statValue: 'text-xs sm:text-sm font-bold text-white',
  overlayPanel: 'absolute bg-black/70 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg',
  gradientButton: 'w-full sm:w-auto px-8 py-4 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 group focus:outline-none focus:ring-2 focus:ring-opacity-50'
} as const;

// Calculate distance between two points (in kilometers) - moved outside component
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

// Optimized rank color getter - moved outside component
const getRankColor = (rank: string): string => {
  return RANK_COLORS[rank.toUpperCase() as keyof typeof RANK_COLORS] || 'text-gray-400';
};

// Optimized achievement icon getter - moved outside component
const getAchievementIcon = (achievement: string): string => {
  if (achievement.includes('speed') || achievement.includes('fast')) return ACHIEVEMENT_ICONS.speed;
  if (achievement.includes('perfect') || achievement.includes('precise')) return ACHIEVEMENT_ICONS.perfect;
  if (achievement.includes('streak')) return ACHIEVEMENT_ICONS.streak;
  if (achievement.includes('exploration') || achievement.includes('discovery')) return ACHIEVEMENT_ICONS.exploration;
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
    // Correct event details field name
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
    // Compatible with legacy field names
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
  
  // Handle restart game functionality with progress tracking - optimized with useCallback
  const handleRestartGame = useCallback(async () => {
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
      setIsRestarting(false);
      setRestartProgress(0);
      alert('Error restarting game. Please try again.');
    }
  }, [router]);
  
  // Optimized state management - memoized calculations
  const eventDetails = useMemo(() => questionResult.event || null, [questionResult.event]);

  // Memoize distance calculation to avoid recalculation on every render
  const distanceValue = useMemo(() => calculateDistance(
    questionResult.guessedLocation.lat,
    questionResult.guessedLocation.lng,
    questionResult.actualLocation.lat,
    questionResult.actualLocation.lng
  ), [questionResult.guessedLocation, questionResult.actualLocation]);

  // Memoize formatted distance strings to avoid string operations on every render
  const formattedDistance = useMemo(() => ({
    rounded: distanceValue.toFixed(0),
    precise: distanceValue.toFixed(1)
  }), [distanceValue]);

  // Memoize distance percentage for progress bar
  const distancePercentage = useMemo(() => 
    Math.min((distanceValue / 1000) * 100, 100),
    [distanceValue]
  );



  // Cache year difference calculation
  const yearDifference = useMemo(() => 
    Math.abs(questionResult.guessedYear - questionResult.actualYear),
    [questionResult.guessedYear, questionResult.actualYear]
  );

  // Cache rank color calculation
  const rankColorClass = useMemo(() => getRankColor(questionResult.scoringDetails.rank), [questionResult.scoringDetails.rank]);

  // Memoize event display values to avoid repeated string operations
  const eventDisplayValues = useMemo(() => ({
    eventName: eventDetails?.event_name || 'Historical Event',
    city: eventDetails?.city || 'Unknown Location',
    achievements: questionResult.scoringDetails.achievements.length > 0 
      ? questionResult.scoringDetails.achievements.slice(0, 2).join(', ') 
      : 'Great performance'
  }), [eventDetails, questionResult.scoringDetails.achievements]);

  // Generate share data for ShareDialog
  const shareData = useMemo(() => ({
    title: `Time Guessr Game - Question ${questionResult.questionNumber} Result`,
    description: `I scored ${questionResult.scoringDetails.finalScore} points (Rank ${questionResult.scoringDetails.rank}) guessing "${eventDisplayValues.eventName}" in ${eventDisplayValues.city}! Year accuracy: ±${yearDifference} years, Distance: ${formattedDistance.precise}km. ${eventDisplayValues.achievements}!`,
    hashtags: ['TimeGuessr', 'HistoryGame', 'Gaming', `Rank${questionResult.scoringDetails.rank}`]
  }), [questionResult, eventDisplayValues, yearDifference, formattedDistance.precise]);

  // Memoize conditional rendering flags
  const shouldShowEventInfo = useMemo(() => 
    Boolean(eventDetails?.event_detail || eventDetails?.description || eventDetails?.city),
    [eventDetails]
  );

  // Memoize next question handler to prevent recreation on every render
  const handleNextQuestion = useCallback(() => {
    if (onNextQuestion) {
      onNextQuestion();
    } else {
      // Fallback: Use page navigation if no callback provided
      window.location.href = '/game';
    }
  }, [onNextQuestion]);

  // Memoize restart confirmation handler
  const handleShowRestartConfirm = useCallback(() => {
    setShowRestartConfirm(true);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl mb-52 md:mb-20">
      <div className="p-3 sm:p-4 md:p-6">
        {/* Optimized title area - more compact layout */}
        <div className={`relative mb-6 ${ANIMATION_CLASSES.fadeInUp}`}>
          {/* Main title bar - responsive layout */}
           <div className="bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 rounded-2xl p-3 sm:p-4 border border-white/20 backdrop-blur-sm">
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center md:justify-between gap-3 sm:gap-4">
               {/* Left side: Question info */}
               <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-base sm:text-lg font-bold shadow-lg flex-shrink-0">
                   {questionResult.questionNumber}
                 </div>
                 <div className="min-w-0 flex-1">
                   <h2 className="text-lg sm:text-xl font-bold text-white truncate">Question Detailed Results</h2>
                   <div className="text-xs sm:text-sm text-gray-300 truncate">Question {questionResult.questionNumber} Analysis</div>
                 </div>
               </div>
               
               {/* Right side: Score card - responsive */}
               <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 border border-yellow-500/30 flex-shrink-0 min-w-0 sm:w-[280px] md:w-[380px]">
                 <div className="flex items-center justify-around md:justify-center gap-6 sm:gap-8 md:gap-12">
                   <div className="text-center flex-1">
                     <div className="text-sm text-gray-400 mb-1">Final Score</div>
                     <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                       {questionResult.scoringDetails.finalScore}
                     </div>
                   </div>
                   <div className="w-px h-12 sm:h-14 md:h-16 bg-gray-600 flex-shrink-0"></div>
                   <div className="text-center flex-1">
                     <div className="text-sm text-gray-400 mb-1">Rank</div>
                     <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${rankColorClass}`}>
                       {questionResult.scoringDetails.rank}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
          
          {/* Quick stats bar - responsive grid */}
           <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
             <div className={`${COMMON_STYLES.statCard} bg-blue-500/20 border border-blue-500/30 ${COMMON_STYLES.statCardHover}`}>
               <div className={`${COMMON_STYLES.statLabel} text-blue-300`}>Answer Time</div>
               <div className={COMMON_STYLES.statValue}>{questionResult.answerTime}s</div>
             </div>
             <div className={`${COMMON_STYLES.statCard} bg-purple-500/20 border border-purple-500/30 ${COMMON_STYLES.statCardHover}`}>
               <div className={`${COMMON_STYLES.statLabel} text-purple-300`}>Year Error</div>
               <div className={COMMON_STYLES.statValue}>±{yearDifference}</div>
             </div>
             <div className={`${COMMON_STYLES.statCard} bg-green-500/20 border border-green-500/30 ${COMMON_STYLES.statCardHover}`}>
               <div className={`${COMMON_STYLES.statLabel} text-green-300`}>Distance</div>
               <div className={COMMON_STYLES.statValue}>{formattedDistance.rounded}km</div>
             </div>
             <div className={`${COMMON_STYLES.statCard} bg-yellow-500/20 border border-yellow-500/30 ${COMMON_STYLES.statCardHover}`}>
               <div className={`${COMMON_STYLES.statLabel} text-yellow-300`}>Streak</div>
               <div className={COMMON_STYLES.statValue}>{questionResult.scoringDetails.streak}</div>
             </div>
           </div>
        </div>

        {/* Core comparison area - image and map layout */}
        <div className="relative mb-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Left side: Image and event information overlay layout */}
            <div className={`relative group ${ANIMATION_CLASSES.slideInLeft} hover-lift glow-effect`}>
              <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-500 group-hover:border-blue-400/50">
                {eventDetails?.image_url ? (
                  <GameImage imageUrl={eventDetails.image_url} eventName={eventDetails.event_name} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className={`text-center ${ANIMATION_CLASSES.bounceIn}`}>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400">Loading image...</p>
                    </div>
                  </div>
                )}
                
                {/* Floating information card */}
                <div className="absolute -bottom-2 md:bottom-2 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="space-x-4 flex">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-yellow-400 animate-pulse" />
                      <span className="text-xl font-bold text-yellow-400">{questionResult.actualYear}</span>
                      <span className="text-gray-300">Year</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-red-400" />
                      <span className="text-lg font-semibold text-white">{eventDisplayValues.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Map and data overlay layout - responsive height */}
            <div className={`relative group ${ANIMATION_CLASSES.slideInRight} hover-lift glow-effect`}>
              <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-500 group-hover:border-green-400/50">
                <GameMap
                  guessLocation={questionResult.guessedLocation}
                  actualLocation={questionResult.actualLocation}
                  isGuessing={false}
                  onMapClick={undefined}
                />
                
                {/* Optimized compact city information panel - top left */}
                <div className={`${COMMON_STYLES.overlayPanel} top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-3 py-1.5 sm:py-2 ${ANIMATION_CLASSES.scaleIn} max-w-[150px] sm:max-w-[200px]`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-white truncate">
                        {eventDisplayValues.city}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Year comparison panel - top right compact layout */}
                <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 ${ANIMATION_CLASSES.scaleIn}`}>
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

                {/* Distance information panel - adjusted to right side lower position */}
                <div className={`absolute right-2 sm:right-3 bottom-12 sm:bottom-10 bg-blue-500/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-400/60 ${ANIMATION_CLASSES.bounceIn} max-w-[120px] sm:max-w-[160px]`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-400 rounded-full flex items-center justify-center">
                      <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] sm:text-xs text-blue-100">Distance Error</div>
                      <div className="text-sm sm:text-lg font-bold text-white">{formattedDistance.precise} km</div>
                    </div>
                  </div>
                </div>

                {/* Simplified distance visualization bar - moved to bottom left to avoid Google logo overlap */}
                <div className={`${COMMON_STYLES.overlayPanel} bottom-12 sm:bottom-14 left-2 sm:left-3 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 ${ANIMATION_CLASSES.bounceIn}`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-[140px] sm:min-w-[180px]">
                    <span className="text-[10px] sm:text-xs text-gray-300 whitespace-nowrap">Precise</span>
                    <div className="flex-1 bg-gray-600/80 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-1.5 sm:h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${distancePercentage}%` 
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
        {shouldShowEventInfo && (
          <div className={`mb-8 ${ANIMATION_CLASSES.fadeInUp}`}>
            <div className="bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {eventDisplayValues.eventName}
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
                    {eventDetails.event_detail || eventDetails.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comprehensive Analysis Area - Integrating all statistical information */}
        <div className={`mb-8 ${ANIMATION_CLASSES.fadeInUp}`}>
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
                <div className="text-xs text-gray-500 mt-1">Error {formattedDistance.rounded}km</div>
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
        </div>
      </div>

      {/* Fixed Bottom Floating Button Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 fixed-bottom-actions bg-gradient-to-t from-black/95 via-black/80 to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {/* Next Question Button - Display based on hasNextQuestion parameter */}
            {hasNextQuestion && (
              <button 
                onClick={handleNextQuestion}
                className={`action-button ${COMMON_STYLES.gradientButton} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 focus:ring-blue-400`}
              >
                <span className="text-lg">➡️</span>
                <span>Next Question</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-pulse"></div>
              </button>
            )}

            {/* Restart Button */}
            <button 
              onClick={handleShowRestartConfirm}
              className={`action-button ${COMMON_STYLES.gradientButton} bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/25 focus:ring-purple-400`}
            >
              <span className="text-lg">🔄</span>
              <span>Restart</span>
              <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-spin"></div>
            </button>

            {/* Share Results Button */}
            <ShareDialog shareData={shareData}>
              <button className={`action-button ${COMMON_STYLES.gradientButton} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/25 focus:ring-green-400`}>
                <Share2 className="w-5 h-5" />
                <span>Share Results</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-bounce"></div>
              </button>
            </ShareDialog>

            {/* Close Button */}
            {onClose && (
              <button 
                onClick={onClose}
                className={`action-button ${COMMON_STYLES.gradientButton} px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:shadow-gray-500/25 focus:ring-gray-400`}
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
