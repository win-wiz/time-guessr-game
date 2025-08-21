"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GameImage } from "@/components/game-image";

// 导入拆分的组件
import { BackgroundImage } from "@/components/game/background-image";
import { GameHeader } from "@/components/game/game-header";
import { MobileInfoPanel } from "@/components/game/mobile-info-panel";
import { DesktopStatusPanel } from "@/components/game/desktop-status-panel";
import { GameHint } from "@/components/game/game-hint";
import { SubmitButton } from "@/components/game/submit-button";
import { MapContainer } from "@/components/game/map-container";
import { GameSummaryPage } from "@/components/game/game-summary-page";
import { LoadingState } from "@/components/game/loading-state";

// 导入统一的API服务
import { 
  GameAPIService, 
  StartGameRequest, 
  StartGameResponse, 
  SubmitAnswerRequest, 
  SubmitAnswerResponse, 
  EventDetail 
} from "@/lib/api-service";

// 导入本地存储服务
import {
  GameProgressManager,
  PlayerSettingsManager,
  GameHistoryManager,
  PlayerStatsManager,
  GameProgress,
  GameScore,
  checkStorageSpace
} from "@/lib/local-storage";

const currentYear = new Date().getFullYear();

export default function Game() {
  const router = useRouter();
  
  // 游戏会话状态
  const [gameSessionId, setGameSessionId] = useState<string>("");
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [questionSessionIds, setQuestionSessionIds] = useState<string[]>([]);
  
  // 游戏进度状态
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [currentEvent, setCurrentEvent] = useState<EventDetail | null>(null);
  
  // 用户输入状态
  const [guessLocation, setGuessLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedYear, setSelectedYear] = useState(2000);
  
  // 游戏状态
  const [gameState, setGameState] = useState<"loading" | "guessing" | "summary">("loading");
  const [timeRemaining, setTimeRemaining] = useState(120); // 默认120秒
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // 游戏分数（使用本地存储类型）
  const [scores, setScores] = useState<GameScore[]>([]);
  
  // 本地存储相关状态
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasStoredProgress, setHasStoredProgress] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // 清除保存的进度
  const clearSavedProgress = useCallback(() => {
    GameProgressManager.clearProgress();
    setHasStoredProgress(false);
  }, []);

  // 加载游戏进度
  const loadGameProgress = useCallback(() => {
    const savedProgress = GameProgressManager.loadProgress();
    if (!savedProgress) return false;

    // 恢复完整的游戏状态
    setGameSessionId(savedProgress.gameSessionId);
    setCurrentRound(savedProgress.currentRound);
    setTotalRounds(savedProgress.totalRounds);
    setTimeRemaining(savedProgress.timeRemaining);
    setEventIds(savedProgress.eventIds);
    setEvents(savedProgress.events);
    setScores(savedProgress.scores);
    setQuestionSessionIds(savedProgress.questionSessionIds);
    setGameStartTime(savedProgress.startTime);
    setGameState("guessing");
    setIsLoading(false);
    setQuestionStartTime(Date.now());

    return true;
  }, []);

  // 保存游戏进度
  const saveGameProgress = useCallback(() => {
    if (!gameSessionId || gameState !== "guessing") return;

    const progress: GameProgress = {
      gameSessionId,
      currentRound,
      totalRounds,
      timeRemaining,
      eventIds,
      events,
      scores,
      questionSessionIds,
      startTime: gameStartTime,
      lastSaveTime: Date.now(),
      gameMode: 'timed',
      timeLimit: 120
    };

    GameProgressManager.saveProgress(progress);
  }, [
    gameSessionId,
    currentRound,
    totalRounds,
    timeRemaining,
    eventIds,
    events,
    scores,
    questionSessionIds,
    gameStartTime,
    gameState
  ]);

  // 初始化游戏 - 使用统一API服务和本地存储
  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setGameState("loading");
      setError(null);
      
      // 检查是否有保存的进度
      if (hasStoredProgress && GameProgressManager.hasProgress()) {
        const loaded = loadGameProgress();
        if (loaded) {
          return; // 成功加载保存的进度
        }
      }
      
      // 加载玩家设置
      const settings = PlayerSettingsManager.loadSettings();
      setAutoSaveEnabled(settings.autoSave);
      
      // 检查存储空间
      const storageInfo = checkStorageSpace();
      if (!storageInfo.hasSpace) {
        setError('存储空间不足，某些功能可能无法正常使用');
      }
      
      // 1. 使用统一API服务开始新游戏
      const gameResponse = await GameAPIService.startGame({
        gameMode: settings.defaultGameMode,
        questionCount: settings.defaultQuestionCount,
        timeLimit: settings.defaultTimeLimit
      });

      const curRound = gameResponse.currentQuestion;
      const eventIds = gameResponse.eventIds;

      setGameSessionId(gameResponse.gameSessionId);
      setEventIds(eventIds);
      setTotalRounds(gameResponse.totalQuestions);
      setTimeRemaining(gameResponse.timeLimit || settings.defaultTimeLimit);
      setGameStartTime(Date.now());
      setCurrentRound(curRound);
      
      // 2. 获取 curRound 的事件信息
      const eventDetails = await GameAPIService.getEventDetail(eventIds[curRound - 1]);
      setCurrentEvent(eventDetails);

      setIsLoading(false);
      setGameState("guessing");
      setQuestionStartTime(Date.now());
      
      // 3. 自动保存初始进度
      if (settings.autoSave) {
        setTimeout(() => saveGameProgress(), 1000);
      }
      
    } catch (error) {
      setError('未知错误' + error);
    }
  }, [hasStoredProgress, loadGameProgress, saveGameProgress]);

  // 使用 useCallback 优化事件处理函数
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (gameState === "guessing") {
      setGuessLocation({ lat, lng });
      // 自动保存进度
      if (autoSaveEnabled) {
        saveGameProgress();
      }
    }
  }, [gameState, autoSaveEnabled, saveGameProgress]);

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
    // 自动保存进度
    if (autoSaveEnabled) {
      saveGameProgress();
    }
  }, [autoSaveEnabled, saveGameProgress]);

  const handleNextRound = useCallback(() => {
    if (currentRound < totalRounds && eventIds.length > currentRound) {
      setCurrentRound(prev => prev + 1);
      setGuessLocation(null);
      setSelectedYear(2000);
      setQuestionStartTime(Date.now());
    } else {
      setGameState("summary");
    }
  }, [currentRound, totalRounds, eventIds.length]);

  const handleSubmitGuess = useCallback(async () => {
    if (!currentEvent || !guessLocation || !gameSessionId) return;

    try {
      setError(null);
      
      // 计算答题时间（秒）
      const answerTime = questionStartTime > 0 ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;
      
      // 使用统一的API服务提交答案
      const submitResponse = await GameAPIService.submitAnswer({
        gameSessionId,
        eventId: currentEvent.id,
        guessedYear: selectedYear,
        guessedLocation: guessLocation,
        answerTime
      });

      // 保存questionSessionId
      setQuestionSessionIds(prev => [...prev, submitResponse.questionSessionId]);
      
      // 创建分数记录
      const newScore: GameScore = {
        score: 800, // 临时分数
        distance: 100, // 临时距离
        yearDifference: Math.abs(selectedYear - currentEvent.year),
        event: {
          id: parseInt(currentEvent.id) || 0,
          city: currentEvent.city,
          latitude: currentEvent.latitude,
          longitude: currentEvent.longitude,
          year: currentEvent.year,
          event_name: currentEvent.description || currentEvent.city,
          event_detail: currentEvent.description || '',
          event_description: currentEvent.description || '',
          image_url: currentEvent.imageUrl || ''
        },
        guessedYear: selectedYear,
        actualLat: currentEvent.latitude,
        actualLng: currentEvent.longitude
      };
      
      setScores(prev => [...prev, newScore]);

      // 自动保存进度
      if (autoSaveEnabled) {
        saveGameProgress();
      }

      // 检查游戏是否完成
      if (submitResponse.status === 'completed') {
        // 游戏完成，清除进度
        clearSavedProgress();
        
        // 跳转到结果页面（数据持久化由API处理）
        router.push(`/game/result?gameSessionId=${gameSessionId}&questionSessionId=${submitResponse.questionSessionId}&status=${submitResponse.status}`);
      } else {
        // 无论是否完成游戏，都跳转到结果页面查看当前题目结果
        router.push(`/game/result?gameSessionId=${gameSessionId}&questionSessionId=${submitResponse.questionSessionId}&status=${submitResponse.status}`);
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
      setError(error instanceof Error ? error.message : '提交答案失败');
      
      // 错误处理：继续下一题或显示错误信息
      setTimeout(() => {
        setError(null);
        handleNextRound();
      }, 3000);
    }
  }, [currentEvent, guessLocation, selectedYear, gameSessionId, questionStartTime, router, scores, autoSaveEnabled, saveGameProgress, clearSavedProgress, handleNextRound]);

  const handlePlayAgain = useCallback(() => {
    // 清除保存的进度
    clearSavedProgress();
    
    // 重置所有状态
    setGameSessionId("");
    setEventIds([]);
    setEvents([]);
    setQuestionSessionIds([]);
    setCurrentRound(1);
    setScores([]);
    setGuessLocation(null);
    setSelectedYear(2000);
    setGameState("loading");
    setIsLoading(true);
    setQuestionStartTime(0);
    setGameStartTime(0);
    setError(null);
    
    // 重新开始游戏
    initializeGame();
  }, [clearSavedProgress, initializeGame]);

  const toggleMapExpanded = useCallback(() => {
    setIsMapExpanded(prev => !prev);
  }, []);

  // 使用 useMemo 优化计算值
  const totalScore = useMemo(() => 
    scores.reduce((sum, round) => sum + round.score, 0), 
    [scores]
  );

  // 检查保存的进度 - 只在组件挂载时执行一次
  useEffect(() => {
    const checkSavedProgress = async () => {
      const hasProgress = GameProgressManager.hasProgress();
      setHasStoredProgress(hasProgress);
      
      // 加载玩家设置
      const settings = PlayerSettingsManager.loadSettings();
      setAutoSaveEnabled(settings.autoSave);
      setSelectedYear(2000); // 重置为默认值
      
      // 如果有保存的进度，询问用户是否继续
      if (hasProgress) {
        const shouldContinue = window.confirm('检测到未完成的游戏，是否继续？');
        if (shouldContinue) {
          const loaded = loadGameProgress();
          if (loaded) {
            return; // 成功加载，不需要初始化新游戏
          }
        } else {
          // 用户选择不继续，清除保存的进度
          clearSavedProgress();
        }
      }
      
      // 初始化新游戏
      await initializeGame();
    };

    checkSavedProgress();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 自动保存进度（每30秒）
  useEffect(() => {
    if (!autoSaveEnabled || gameState !== "guessing") return;

    const autoSaveInterval = setInterval(() => {
      saveGameProgress();
    }, 30000); // 30秒自动保存

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, gameState, saveGameProgress]);

  // 页面卸载时保存进度
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (autoSaveEnabled && gameState === "guessing") {
        saveGameProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveEnabled, gameState, saveGameProgress]);

  // 设置当前事件
  useEffect(() => {
    if (events.length > 0 && currentRound <= events.length && !isLoading) {
      const event = events[currentRound - 1];
      setCurrentEvent(event);
      if (currentRound > 1) {
        // 新题目开始时重置状态
        setGuessLocation(null);
        setSelectedYear(2000);
        setQuestionStartTime(Date.now());
      }
    }
  }, [currentRound, events, isLoading]);

  // 时间倒计时
  useEffect(() => {
    if (gameState === "guessing" && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "guessing" && timeRemaining === 0) {
      // 时间到自动提交
      handleSubmitGuess();
    }
  }, [timeRemaining, gameState, handleSubmitGuess]);

  // 如果正在加载，显示加载状态
  if (gameState === "loading" || isLoading) {
    return <LoadingState />;
  }

  return (
    <main className="h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* 错误提示 */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* 背景图片 */}
      {currentEvent && <BackgroundImage imageUrl={currentEvent.imageUrl || ''} />}

      {/* 游戏头部 */}
      <GameHeader
        currentRound={currentRound}
        totalRounds={totalRounds}
        scores={scores}
        onSettingsChange={() => {
          // 重新加载设置
          const newSettings = PlayerSettingsManager.loadSettings();
          setAutoSaveEnabled(newSettings.autoSave);
          // 可以在这里添加其他设置变更的处理逻辑
        }}
      />
      
      {gameState === "guessing" && currentEvent && (
        <div className="relative z-10 pointer-events-none flex-1">
          {/* 中央图片区域 */}
          <div className="absolute w-full md:w-1/2 left-1/2 top-32 md:top-10 transform -translate-x-1/2 z-20 pointer-events-auto px-4 md:px-0" 
               style={{ height: 'calc(100vh - 400px)', maxHeight: 'calc(100vh - 400px)', minHeight: '200px' }}>
            <GameImage 
              imageUrl={currentEvent.imageUrl || ''} 
              eventName={currentEvent.description || ''}
            />
          </div>

          {/* 移动端信息面板 */}
          <MobileInfoPanel
            eventName={currentEvent.description || ''}
            currentRound={currentRound}
            totalRounds={totalRounds}
            timeRemaining={timeRemaining}
            guessLocation={guessLocation}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            currentYear={currentYear}
          />

          {/* 桌面端游戏提示 */}
          <GameHint
            eventName={currentEvent.description || ''}
            currentRound={currentRound}
            totalRounds={totalRounds}
          />

          {/* 桌面端状态面板 */}
          <DesktopStatusPanel
            timeRemaining={timeRemaining}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            guessLocation={guessLocation}
            currentYear={currentYear}
          />

          {/* 移动端底部提交按钮 */}
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-40 pointer-events-auto">
            <SubmitButton
              onSubmit={handleSubmitGuess}
              guessLocation={guessLocation}
              isMobile={true}
            />
          </div>

          {/* 地图容器和桌面端提交按钮的组合容器 */}
          <div className="absolute bottom-20 md:bottom-4 left-4 right-4 z-30 pointer-events-auto">
            {/* 桌面端提交按钮 - 位于地图上方 */}
            <div className="hidden md:flex justify-center z-50 pointer-events-auto relative -bottom-6">
              <SubmitButton
                onSubmit={handleSubmitGuess}
                guessLocation={guessLocation}
              />
            </div>
            
            {/* 地图容器 */}
            <MapContainer
              onMapClick={handleMapClick}
              guessLocation={guessLocation}
              isMapExpanded={isMapExpanded}
              onToggleExpanded={toggleMapExpanded}
            />
          </div>
        </div>
      )}

      {gameState === "summary" && (
        <GameSummaryPage
          totalRounds={totalRounds}
          totalScore={totalScore}
          scores={scores}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </main>
  );
}
