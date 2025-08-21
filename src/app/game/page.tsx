"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  EventDetail 
} from "@/lib/api-service";

// 导入本地存储服务
import {
  GameProgressManager,
  PlayerSettingsManager,
  GameProgress,
  GameScore,
  checkStorageSpace
} from "@/lib/local-storage";

// 导入轮次管理器
import { loadResumeInfo } from "@/lib/game-round-manager";

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
  const [timeWarning, setTimeWarning] = useState<boolean>(false); // 时间警告状态
  const [isTimerStopped, setIsTimerStopped] = useState(false); // 控制计时器是否停止
  const [submitError, setSubmitError] = useState<string | null>(null); // 提交错误状态
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交中状态
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

  // 网络状态检测
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
     const handleOnline = () => {
       console.log('[Network] Connection restored');
       setIsOnline(true);
       // 网络恢复时，如果有错误状态，提示用户重试
       if (error && error.includes('网络')) {
         setError(null);
         if (confirm('网络连接已恢复，是否重试？')) {
           if (gameState === 'loading') {
             // 延迟调用initializeGame，避免依赖问题
             setTimeout(() => {
               window.location.reload();
             }, 100);
           }
         }
       }
     };
     
     const handleOffline = () => {
       console.log('[Network] Connection lost');
       setIsOnline(false);
       setError('网络连接已断开，请检查网络连接');
     };
     
     window.addEventListener('online', handleOnline);
     window.addEventListener('offline', handleOffline);
     
     return () => {
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
     };
   }, [error, gameState]);
  
  // 通用重试函数 - 增加网络状态检查
  const retryWithBackoff = useCallback(async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 检查网络状态
        if (!navigator.onLine) {
          throw new Error('网络连接不可用');
        }
        
        console.log(`Attempt ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          // 最后一次重试失败，根据错误类型抛出更具体的错误
          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch') || !navigator.onLine) {
              throw new Error('网络连接失败，请检查网络后重试');
            }
          }
          throw error;
        }
        
        // 指数退避延迟
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }, []);

  // 加载当前题目 - 按需加载版本（增强错误处理）
  const loadCurrentQuestion = useCallback(async (savedProgress: GameProgress) => {
    try {
      setIsLoading(true);
      console.log(`[LoadQuestion] Starting load for round ${savedProgress.currentRound}`);
      
      // 检查是否还有题目
      if (savedProgress.currentRound > savedProgress.totalRounds) {
        console.log('[LoadQuestion] All questions completed, going to summary');
        setGameState("summary");
        setIsLoading(false);
        return;
      }
      
      // 只加载当前需要的事件，不是所有事件
      const currentEventIndex = savedProgress.currentRound - 1;
      let currentEvent: EventDetail | null = null;
      
      // 检查是否已有保存的当前事件
      if (savedProgress.events[currentEventIndex]) {
        currentEvent = savedProgress.events[currentEventIndex];
        console.log(`[LoadQuestion] Using cached event: ${currentEvent!.city} (${currentEvent!.year})`);
      } else {
        // 按需加载当前事件（带重试机制）
        const eventId = savedProgress.eventIds[currentEventIndex];
        console.log(`[LoadQuestion] Loading event ${eventId} for round ${savedProgress.currentRound}`);
        
        try {
          currentEvent = await retryWithBackoff(async () => {
            return await GameAPIService.getEventDetail(eventId);
          });
          
          if (!currentEvent) {
            throw new Error('事件详情为空');
          }
          
          console.log(`[LoadQuestion] Successfully loaded event: ${currentEvent.city} (${currentEvent.year})`);
        } catch (error) {
          console.error(`[LoadQuestion] Failed to load event ${eventId} after retries:`, error);
          setError(`加载第${savedProgress.currentRound}题失败，请检查网络连接后重试`);
          setIsLoading(false);
          return;
        }
      }
      
      // 检查currentEvent是否为null
      if (!currentEvent) {
        console.error('[LoadQuestion] Current event is null after loading');
        setError('加载题目数据异常');
        setIsLoading(false);
        return;
      }
      
      // 初始化events数组，只设置当前事件
      const eventsArray: EventDetail[] = new Array(savedProgress.eventIds.length);
      eventsArray[currentEventIndex] = currentEvent;
      
      // 复制已保存的其他事件（如果有的话）
      savedProgress.events.forEach((event, index) => {
        if (event && index !== currentEventIndex) {
          eventsArray[index] = event;
        }
      });
      
      setEvents(eventsArray);
      setCurrentEvent(currentEvent);
      
      // 重置计时器到初始值并启动计时器
      const settings = PlayerSettingsManager.loadSettings();
      setTimeRemaining(settings.defaultTimeLimit || 120);
      setIsTimerStopped(false);
      setTimeWarning(false);
      console.log(`[LoadQuestion] Timer reset to ${settings.defaultTimeLimit || 120} seconds for new question`);
      
      setIsLoading(false);
      setGameState("guessing");
      setQuestionStartTime(Date.now());
      console.log(`[LoadQuestion] Successfully loaded round ${savedProgress.currentRound}`);
      
    } catch (error) {
      console.error('[LoadQuestion] Unexpected error:', error);
      setError('加载题目时发生未知错误');
      setIsLoading(false);
    }
  }, [retryWithBackoff]);

  // 加载游戏进度
  const loadGameProgress = useCallback(() => {
    const savedProgress = GameProgressManager.loadProgress();
    if (!savedProgress) {
      console.log('[LoadProgress] No saved progress found');
      return false;
    }

    console.log('[LoadProgress] Loading saved progress:', {
      gameSessionId: savedProgress.gameSessionId,
      currentRound: savedProgress.currentRound,
      totalRounds: savedProgress.totalRounds,
      eventIdsLength: savedProgress.eventIds?.length || 0,
      eventsLength: savedProgress.events?.length || 0,
      scoresLength: savedProgress.scores?.length || 0
    });

    // 验证必要的数据
    if (!savedProgress.gameSessionId || !savedProgress.eventIds || savedProgress.eventIds.length === 0) {
      console.error('[LoadProgress] Invalid saved progress data, missing required fields');
      GameProgressManager.clearProgress();
      return false;
    }

    // 恢复完整的游戏状态
    setGameSessionId(savedProgress.gameSessionId);
    setCurrentRound(savedProgress.currentRound);
    setTotalRounds(savedProgress.totalRounds);
    setTimeRemaining(savedProgress.timeRemaining);
    setEventIds(savedProgress.eventIds);
    setEvents(savedProgress.events || []);
    setScores(savedProgress.scores || []);
    setQuestionSessionIds(savedProgress.questionSessionIds || []);
    setGameStartTime(savedProgress.startTime);
    setGameState("guessing");
    setIsLoading(false);
    setQuestionStartTime(Date.now());

    console.log('[LoadProgress] Game progress loaded successfully');
    return true;
  }, []);

  // 使用useRef存储最新状态，避免useCallback依赖过多导致频繁重新创建
  const gameStateRef = useRef({
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
  });

  // 更新ref中的状态 - 添加调试日志
  useEffect(() => {
    const prevState = gameStateRef.current;
    const newState = {
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
    };
    
    // 简化调试日志
    if (prevState.currentRound !== newState.currentRound) {
      console.log(`Round: ${prevState.currentRound} → ${newState.currentRound}`);
    }
    if (prevState.gameState !== newState.gameState) {
      console.log(`State: ${prevState.gameState} → ${newState.gameState}`);
    }
    
    gameStateRef.current = newState;
  });

  // 保存游戏进度 - 优化依赖，避免循环依赖
  const saveGameProgress = useCallback(() => {
    const state = gameStateRef.current;
    
    console.log('[SaveProgress] Attempting to save game progress:', {
      gameSessionId: state.gameSessionId,
      currentRound: state.currentRound,
      totalRounds: state.totalRounds,
      gameState: state.gameState,
      eventIdsLength: state.eventIds?.length || 0,
      eventsLength: state.events?.length || 0,
      scoresLength: state.scores?.length || 0
    });
    
    if (!state.gameSessionId || !state.eventIds || state.eventIds.length === 0) {
      console.warn('[SaveProgress] Missing required data for saving progress:', {
        hasGameSessionId: !!state.gameSessionId,
        hasEventIds: !!state.eventIds,
        eventIdsLength: state.eventIds?.length || 0,
        gameState: state.gameState
      });
      return;
    }

    try {
      const progress: GameProgress = {
        gameSessionId: state.gameSessionId,
        currentRound: state.currentRound,
        totalRounds: state.totalRounds,
        timeRemaining: state.timeRemaining,
        eventIds: state.eventIds,
        events: state.events,
        scores: state.scores,
        questionSessionIds: state.questionSessionIds,
        startTime: state.gameStartTime,
        lastSaveTime: Date.now(),
        gameMode: 'timed',
        timeLimit: 120
      };

      // 使用防抖机制，避免过于频繁的保存
      GameProgressManager.saveProgress(progress);
      console.log(`[SaveProgress] Game progress saved successfully: Round ${state.currentRound}, Time remaining: ${state.timeRemaining}s`);
      
      // 检查存储空间
      const storageInfo = checkStorageSpace();
      if (!storageInfo.hasSpace) {
        console.warn('[SaveProgress] Storage space is running low');
      }
    } catch (error) {
      console.error('[SaveProgress] Failed to save game progress:', error);
    }
  }, []); // 移除所有依赖，使用ref获取最新状态

  // 初始化游戏 - 按照文档要求重构
  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setGameState("loading");
      setError(null);
      
      // 检查是否有保存的进度 - 直接检查localStorage，不依赖hasStoredProgress状态
      const hasProgress = GameProgressManager.hasProgress();
      console.log('[GameInit] Checking for saved progress:', hasProgress);
      
      if (hasProgress) {
        const loaded = loadGameProgress();
        if (loaded) {
          console.log('[GameInit] Successfully loaded saved progress, skipping new game initialization');
          return; // 成功加载保存的进度
        }
        console.log('[GameInit] Failed to load saved progress, clearing and starting new game');
        GameProgressManager.clearProgress();
      }
      
      // 加载玩家设置
      const settings = PlayerSettingsManager.loadSettings();
      setAutoSaveEnabled(settings.autoSave);
      
      // 检查存储空间
      const storageInfo = checkStorageSpace();
      if (!storageInfo.hasSpace) {
        setError('存储空间不足，某些功能可能无法正常使用');
      }
      
      // 1. 调用 /game/start 获取游戏会话ID、currentRound及游戏 eventIds
      console.log('[GameInit] Starting new game...');
      const gameResponse = await retryWithBackoff(async () => {
        return await GameAPIService.startGame({
          gameMode: settings.defaultGameMode,
          questionCount: settings.defaultQuestionCount,
          timeLimit: settings.defaultTimeLimit
        });
      });

      const { gameSessionId, eventIds, currentQuestion, totalQuestions, timeLimit } = gameResponse;
      console.log(`[GameInit] Game started: sessionId=${gameSessionId}, currentRound=${currentQuestion}, totalRounds=${totalQuestions}`);

      // 设置基础游戏状态
      setGameSessionId(gameSessionId);
      setEventIds(eventIds);
      setCurrentRound(currentQuestion);
      setTotalRounds(totalQuestions);
      setTimeRemaining(timeLimit || settings.defaultTimeLimit);
      setGameStartTime(Date.now());
      
      // 2. 根据 currentRound 获取当前题目 eventId
      const currentEventId = eventIds[currentQuestion - 1];
      if (!currentEventId) {
        throw new Error(`No eventId found for round ${currentQuestion}`);
      }
      
      // 3. 按需加载当前轮次的事件详情
      console.log(`[GameInit] Loading event detail for round ${currentQuestion}: ${currentEventId}`);
      
      // 先检查缓存中是否有该事件
      let currentEventDetail: EventDetail;
      
      try {
        currentEventDetail = await retryWithBackoff(async () => {
          return await GameAPIService.getEventDetail(currentEventId);
        });
        
        if (!currentEventDetail) {
          throw new Error('无法加载事件详情');
        }
        
        console.log(`[GameInit] Event loaded: ${currentEventDetail.city} (${currentEventDetail.year})`);
      } catch (error) {
        console.error(`[GameInit] Failed to load event ${currentEventId}:`, error);
        throw new Error(`加载第${currentQuestion}题失败`);
      }
      
      // 初始化events数组，只设置当前事件
      const initialEvents: EventDetail[] = new Array(eventIds.length);
      initialEvents[currentQuestion - 1] = currentEventDetail;
      
      setEvents(initialEvents);
      setCurrentEvent(currentEventDetail);
      setIsLoading(false);
      setGameState("guessing");
      setQuestionStartTime(Date.now());
      
      // 预加载下一题事件（异步执行，不阻塞当前流程）
      setTimeout(() => {
        preloadNextEvent();
      }, 1000);
      
      // 4. 自动保存初始进度
      if (settings.autoSave) {
        setTimeout(() => saveGameProgress(), 1000);
      }
      
      console.log(`[GameInit] Game initialization completed for round ${currentQuestion}`);
      
    } catch (error) {
      console.error('[GameInit] Initialize game error:', error);
      
      // 根据错误类型提供更具体的错误信息和处理方案
      let errorMessage = '游戏初始化失败';
      let showRetry = true;
      
      if (error instanceof Error) {
        if (error.message.includes('网络') || error.message.includes('Failed to fetch')) {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else if (error.message.includes('事件') || error.message.includes('Event')) {
          errorMessage = '加载游戏内容失败，请重试';
        } else if (error.message.includes('存储') || error.message.includes('Storage')) {
          errorMessage = '本地存储异常，请清理浏览器缓存后重试';
          showRetry = false;
        } else {
          errorMessage = `初始化失败: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      // 根据错误类型决定是否自动重试
      if (showRetry) {
        setTimeout(() => {
          if (confirm(`${errorMessage}\n\n是否重试？`)) {
            setError(null);
            setIsLoading(true);
            initializeGame();
          }
        }, 2000);
      }
    }
  }, [hasStoredProgress, loadGameProgress, retryWithBackoff]); // 添加retryWithBackoff依赖

  // 使用 useCallback 优化事件处理函数 - 优化依赖
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (gameState === "guessing") {
      setGuessLocation({ lat, lng });
      // 自动保存进度
      if (autoSaveEnabled) {
        saveGameProgress();
      }
    }
  }, [gameState, autoSaveEnabled]); // 移除saveGameProgress依赖

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
    // 自动保存进度
    if (autoSaveEnabled) {
      saveGameProgress();
    }
  }, [autoSaveEnabled]); // 移除saveGameProgress依赖

  const handleNextRound = useCallback(() => {
    console.log(`=== HANDLE NEXT ROUND ===`);
    console.log(`Current round: ${currentRound}, Total rounds: ${totalRounds}`);
    console.log(`EventIds length: ${eventIds.length}`);
    
    if (currentRound < totalRounds && eventIds.length >= totalRounds) {
      const nextRound = currentRound + 1;
      console.log(`Advancing to round ${nextRound}`);
      
      // 清除当前事件，避免显示错误的事件
      setCurrentEvent(null);
      setGuessLocation(null);
      setSelectedYear(2000);
      
      // 更新轮次，useEffect会处理按需加载下一个事件
      setCurrentRound(nextRound);
      
      // 立即更新并保存进度
      const updatedProgress: GameProgress = {
        gameSessionId,
        currentRound: nextRound, // 使用新的轮次
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
      
      GameProgressManager.saveProgress(updatedProgress);
      console.log(`Progress saved with round ${nextRound}`);
      
    } else {
      // 所有题目完成，跳转到总结页面
      console.log('All rounds completed, going to summary');
      setGameState("summary");
      clearSavedProgress();
    }
  }, [currentRound, totalRounds, eventIds.length, clearSavedProgress, gameSessionId, timeRemaining, eventIds, events, scores, questionSessionIds, gameStartTime]);

  // 统一的错误清理函数
  const clearErrors = useCallback(() => {
    setSubmitError(null);
    setError(null);
  }, []);

  const handleSubmitGuess = useCallback(async () => {
    if (!currentEvent || !guessLocation || !gameSessionId) {
      console.warn('[SubmitGuess] Missing required data:', { currentEvent: !!currentEvent, guessLocation: !!guessLocation, gameSessionId: !!gameSessionId });
      return;
    }

    try {
      // 停止计时器
      setIsTimerStopped(true);
      console.log('[SubmitGuess] Timer stopped due to answer submission');
      
      setIsSubmitting(true);
      clearErrors();
      setTimeWarning(false);
      
      console.log(`[SubmitGuess] Submitting answer for round ${currentRound}`);
      
      // 计算答题时间（秒）
      const answerTime = questionStartTime > 0 ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;
      
      // 4. 用户提交答案后，调用 /game/submit 提交答案
      const submitResponse = await retryWithBackoff(async () => {
        return await GameAPIService.submitAnswer({
          gameSessionId,
          eventId: currentEvent.id,
          guessedYear: selectedYear,
          guessedLocation: guessLocation,
          answerTime
        });
      });

      console.log(`[SubmitGuess] Answer submitted: questionSessionId=${submitResponse.questionSessionId}, status=${submitResponse.status}`);

      // 保存questionSessionId
      setQuestionSessionIds(prev => [...prev, submitResponse.questionSessionId]);
      
      // 立即获取结果并更新分数
      try {
        const questionResult = await GameAPIService.getQuestionResult(submitResponse.questionSessionId);
        
        // 构建新的分数对象
        const newScore: GameScore = {
          score: questionResult.scoringDetails.finalScore,
          distance: 0,
          yearDifference: Math.abs(questionResult.guessedYear - questionResult.actualYear),
          event: {
            id: parseInt(questionResult.eventId),
            city: questionResult.event?.city || '',
            latitude: questionResult.actualLocation.lat,
            longitude: questionResult.actualLocation.lng,
            year: questionResult.actualYear,
            event_name: '',
            event_detail: '',
            event_description: '',
            image_url: ''
          },
          guessedYear: questionResult.guessedYear,
          actualLat: questionResult.actualLocation.lat,
          actualLng: questionResult.actualLocation.lng
        };
        
        // 更新分数状态
        setScores(prev => [...prev, newScore]);
        console.log('Updated scores with new result:', newScore);
      } catch (error) {
        console.error('Failed to fetch question result for immediate score update:', error);
      }
      
      // 自动保存进度
      if (autoSaveEnabled) {
        saveGameProgress();
      }

      // 5. 接口返回后，调用 /game/result/{gameSessionId} 获取游戏结果（在结果页面处理）
      // 6. 在游戏结果页中，点击继续游戏，返回 game 游戏页面，此时 currentRound 加一
      
      // 检查游戏是否完成
      if (submitResponse.status === 'completed') {
        console.log('[SubmitGuess] Game completed, navigating to final results');
        // 8. 当 currentRound 等于游戏总轮数时，游戏结束
        clearSavedProgress();
        
        // 跳转到最终结果页面
        router.push(`/game/result?gameSessionId=${gameSessionId}&questionSessionId=${submitResponse.questionSessionId}&status=${submitResponse.status}&currentRound=${currentRound}`);
      } else {
        console.log('[SubmitGuess] Round completed, navigating to round results');
        // 跳转到当前题目结果页面，用户可以选择继续下一题
        router.push(`/game/result?gameSessionId=${gameSessionId}&questionSessionId=${submitResponse.questionSessionId}&status=${submitResponse.status}&currentRound=${currentRound}&totalRounds=${totalRounds}`);
      }
    } catch (error) {
      console.error('[SubmitGuess] Error submitting guess:', error);
      const errorMessage = error instanceof Error ? error.message : '提交答案失败';
      setSubmitError(errorMessage);
      setError(errorMessage);
      
      // 显示错误信息，让用户选择重试或跳过
      setTimeout(() => {
        clearErrors();
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentEvent, guessLocation, selectedYear, gameSessionId, questionStartTime, currentRound, totalRounds, router, autoSaveEnabled, retryWithBackoff, clearSavedProgress, clearErrors]);

  // 预加载下一题事件（提升用户体验）
  const preloadNextEvent = useCallback(async () => {
    if (!eventIds || currentRound >= totalRounds) return;
    
    const nextEventId = eventIds[currentRound]; // currentRound是从1开始的，所以下一题的索引是currentRound
    if (!nextEventId) return;
    
    try {
      console.log(`[PreloadEvent] Preloading next event: ${nextEventId}`);
      const eventDetail = await GameAPIService.getEventDetail(nextEventId);
      console.log(`[PreloadEvent] Next event preloaded: ${eventDetail.city}`);
    } catch (error) {
      console.warn(`[PreloadEvent] Failed to preload next event ${nextEventId}:`, error);
    }
  }, [eventIds, currentRound, totalRounds]);
  
  // 重试提交函数
  const handleRetrySubmit = useCallback(() => {
    clearErrors();
    handleSubmitGuess();
  }, [clearErrors, handleSubmitGuess]);

  // 跳过当前题目函数
  const handleSkipQuestion = useCallback(() => {
    clearErrors();
    handleNextRound();
  }, [clearErrors, handleNextRound]);

  // 统一的状态恢复函数
  const restoreGameState = useCallback(async (progress: GameProgress, targetRound?: number) => {
    console.log('Restoring game state:', { progress, targetRound });
    
    const roundToLoad = targetRound || progress.currentRound;
    
    // 恢复基本状态
    setGameSessionId(progress.gameSessionId);
    setCurrentRound(roundToLoad);
    setTotalRounds(progress.totalRounds);
    setTimeRemaining(progress.timeRemaining);
    setEventIds(progress.eventIds);
    setEvents(progress.events);
    setQuestionSessionIds(progress.questionSessionIds);
    setGameStartTime(progress.startTime);
    
    // 如果是从结果页面返回，检查是否需要更新分数
    let updatedScores = progress.scores;
    if (targetRound && targetRound > progress.currentRound) {
      // 从结果页面返回，需要获取上一题的结果并更新分数
      const previousRound = targetRound - 1;
      const previousQuestionSessionId = progress.questionSessionIds[previousRound - 1];
      
      if (previousQuestionSessionId && previousRound > progress.scores.length) {
        try {
          console.log(`Fetching result for previous round ${previousRound}, questionSessionId: ${previousQuestionSessionId}`);
          const questionResult = await GameAPIService.getQuestionResult(previousQuestionSessionId);
          
          // 构建新的分数对象
          const newScore: GameScore = {
            score: questionResult.scoringDetails.finalScore,
            distance: 0, // 这些字段在当前实现中可能不需要，但接口要求
            yearDifference: Math.abs(questionResult.guessedYear - questionResult.actualYear),
            event: {
              id: parseInt(questionResult.eventId),
              city: questionResult.event?.city || '',
              latitude: questionResult.actualLocation.lat,
              longitude: questionResult.actualLocation.lng,
              year: questionResult.actualYear,
              event_name: '',
              event_detail: '',
              event_description: '',
              image_url: ''
            },
            guessedYear: questionResult.guessedYear,
            actualLat: questionResult.actualLocation.lat,
            actualLng: questionResult.actualLocation.lng
          };
          
          updatedScores = [...progress.scores, newScore];
          console.log('Updated scores with new result:', updatedScores);
        } catch (error) {
          console.error('Failed to fetch question result for score update:', error);
        }
      }
    }
    
    setScores(updatedScores);
    
    // 检查游戏是否完成
    if (roundToLoad > progress.totalRounds) {
      setGameState("summary");
      setIsLoading(false);
      return;
    }
    
    // 加载当前轮次的事件
    try {
      setIsLoading(true);
      const eventIndex = roundToLoad - 1;
      const eventId = progress.eventIds[eventIndex];
      
      if (!eventId) {
        throw new Error(`No eventId found for round ${roundToLoad}`);
      }
      
      const eventDetail = await GameAPIService.getEventDetail(eventId);
      console.log(`Loaded event for round ${roundToLoad}: ${eventDetail.city} (${eventDetail.year})`);
      
      // 更新当前事件
      setCurrentEvent(eventDetail);
      setGuessLocation(null);
      setSelectedYear(2000);
      setQuestionStartTime(Date.now());
      
      // 重置计时器到初始值并启动计时器
      const settings = PlayerSettingsManager.loadSettings();
      setTimeRemaining(settings.defaultTimeLimit || 120);
      setIsTimerStopped(false);
      setTimeWarning(false);
      console.log(`[RestoreGame] Timer reset to ${settings.defaultTimeLimit || 120} seconds for restored question`);
      
      setGameState("guessing");
      setIsLoading(false);
      
      // 保存更新后的进度
      const updatedProgress = { ...progress, currentRound: roundToLoad };
      GameProgressManager.saveProgress(updatedProgress);
      
    } catch (error) {
      console.error(`Error loading event for round ${roundToLoad}:`, error);
      setError(`加载第${roundToLoad}题失败`);
      setIsLoading(false);
    }
  }, []);

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

  // 页面初始化 - 检查并恢复保存的游戏状态
  useEffect(() => {
    const initializePage = async () => {
      try {
        console.log('[PageInit] Starting page initialization');
        
        // 检查是否需要强制重新加载
        const forceReload = sessionStorage.getItem('force_reload_game');
        if (forceReload) {
          sessionStorage.removeItem('force_reload_game');
          console.log('[PageInit] Force reload detected, clearing cache');
        }
        
        // 首先检查是否从结果页面返回
        const urlParams = new URLSearchParams(window.location.search);
        const resumeFlag = urlParams.get('resume');
        const gameSessionIdParam = urlParams.get('gameSessionId');
        const roundParam = urlParams.get('round');
        const totalRoundsParam = urlParams.get('totalRounds');
        
        // 使用轮次管理器检查恢复信息
        const resumeInfo = loadResumeInfo();
        
        console.log(`=== GAME PAGE INITIALIZATION ===`);
        console.log(`Resume flag: ${resumeFlag}`);
        console.log(`URL params - gameSessionId: ${gameSessionIdParam}, round: ${roundParam}, totalRounds: ${totalRoundsParam}`);
        console.log(`Resume info:`, resumeInfo);
        
        // 如果是从结果页面返回，优先使用恢复信息
        if (resumeFlag === 'true' && (resumeInfo || (gameSessionIdParam && roundParam))) {
          const targetGameSessionId = resumeInfo?.gameSessionId || gameSessionIdParam;
          const targetRound = resumeInfo?.nextRound || parseInt(roundParam || '1');
          const targetTotalRounds = resumeInfo?.totalRounds || 5;
          
          console.log(`=== RESUMING GAME FROM RESULT PAGE ===`);
          console.log(`Target sessionId: ${targetGameSessionId}, Target round: ${targetRound}, Total rounds: ${targetTotalRounds}`);
          
          // 检查是否有匹配的保存进度
          const savedProgress = GameProgressManager.loadProgress();
          if (savedProgress && savedProgress.gameSessionId === targetGameSessionId) {
            console.log(`Found matching saved progress, updating round from ${savedProgress.currentRound} to ${targetRound}`);
            
            // 更新轮次信息
            const updatedProgress = {
              ...savedProgress,
              currentRound: targetRound,
              totalRounds: targetTotalRounds
            };
            
            // 使用统一的恢复函数
            await restoreGameState(updatedProgress, targetRound);
            return;
          } else {
            console.log(`No matching saved progress found for gameSessionId: ${targetGameSessionId}`);
          }
        }
        
        // 检查本地存储的游戏进度
        const hasProgress = GameProgressManager.hasProgress();
        console.log('[PageInit] Checking localStorage progress:', hasProgress);
        setHasStoredProgress(hasProgress);
        
        // 加载玩家设置
        const settings = PlayerSettingsManager.loadSettings();
        setAutoSaveEnabled(settings.autoSave);
        setSelectedYear(2000); // 重置为默认值
        
        if (hasProgress) {
          console.log('[PageInit] Found saved progress, attempting to restore');
          // 直接调用loadGameProgress而不是restoreGameState
          const loaded = loadGameProgress();
          if (!loaded) {
            console.log('[PageInit] Failed to load progress, initializing new game');
            await initializeGame();
          } else {
            console.log('[PageInit] Successfully restored game from localStorage');
          }
        } else {
          console.log('[PageInit] No saved progress found, initializing new game');
          await initializeGame();
        }
      } catch (error) {
        console.error('[PageInit] Page initialization failed:', error);
        setError('页面初始化失败，请刷新重试');
        setIsLoading(false);
      }
    };
    
    initializePage();
   }, [initializeGame, loadGameProgress]); // 添加必要的依赖

  // 自动保存进度（每30秒）- 优化依赖
  useEffect(() => {
    if (!autoSaveEnabled || gameState !== "guessing") return;

    const autoSaveInterval = setInterval(() => {
      saveGameProgress();
    }, 30000); // 30秒自动保存

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, gameState]); // 移除saveGameProgress依赖

  // 页面卸载时保存进度 - 优化依赖
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = gameStateRef.current;
      if (state.gameSessionId && state.gameState === "guessing") {
        // 直接调用保存逻辑，避免依赖saveGameProgress
        const progress: GameProgress = {
          gameSessionId: state.gameSessionId,
          currentRound: state.currentRound,
          totalRounds: state.totalRounds,
          timeRemaining: state.timeRemaining,
          eventIds: state.eventIds,
          events: state.events,
          scores: state.scores,
          questionSessionIds: state.questionSessionIds,
          startTime: state.gameStartTime,
          lastSaveTime: Date.now(),
          gameMode: 'timed',
          timeLimit: 120
        };
        GameProgressManager.saveProgress(progress);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // 移除所有依赖，使用ref获取状态

  // 为当前轮次加载事件详情 - 按需加载版本（增强错误处理）
  const loadEventForCurrentRound = useCallback(async () => {
    const state = gameStateRef.current;
    if (!state.eventIds.length || state.currentRound <= 0 || state.currentRound > state.eventIds.length) {
      console.warn(`[LoadEvent] Invalid parameters: currentRound=${state.currentRound}, eventIds.length=${state.eventIds.length}`);
      return;
    }
    
    try {
      setIsLoading(true);
      const eventId = state.eventIds[state.currentRound - 1];
      console.log(`[LoadEvent] Starting load for round ${state.currentRound}, eventId: ${eventId}`);
      
      // 使用重试机制从API获取事件数据
      const eventDetail = await retryWithBackoff(async () => {
        return await GameAPIService.getEventDetail(eventId);
      });
      console.log(`[LoadEvent] Successfully loaded: ${eventDetail.city} (${eventDetail.year})`);
      
      // 更新events数组，只在对应位置设置事件
      setEvents(prevEvents => {
        const newEvents = [...prevEvents];
        newEvents[state.currentRound - 1] = eventDetail;
        console.log(`[LoadEvent] Updated events array at index ${state.currentRound - 1}`);
        return newEvents;
      });
      
      // 直接设置当前事件
      setCurrentEvent(eventDetail);
      setGuessLocation(null);
      setSelectedYear(2000);
      setQuestionStartTime(Date.now());
      
      // 重置计时器到初始值并启动计时器
      const settings = PlayerSettingsManager.loadSettings();
      setTimeRemaining(settings.defaultTimeLimit || 120);
      setIsTimerStopped(false);
      setTimeWarning(false);
      console.log(`[LoadEvent] Timer reset to ${settings.defaultTimeLimit || 120} seconds for new question`);
      
      setGameState("guessing");
      setIsLoading(false);
      
      // 保存更新后的进度
      if (autoSaveEnabled) {
        setTimeout(() => {
          console.log(`[LoadEvent] Auto-saving progress after loading round ${state.currentRound}`);
          saveGameProgress();
        }, 1000);
      }
      
      console.log(`[LoadEvent] Successfully completed loading round ${state.currentRound}`);
      
    } catch (error) {
      console.error(`[LoadEvent] Failed to load event for round ${state.currentRound} after retries:`, error);
      setError(`加载第${state.currentRound}题失败，请检查网络连接后重试`);
      setIsLoading(false);
    }
  }, [autoSaveEnabled, retryWithBackoff]); // 大幅简化依赖项

  // 优化的题目切换逻辑 - 按需加载事件，优化依赖
  useEffect(() => {
    if (gameState === "guessing" && !isLoading && eventIds.length > 0) {
      // 检查当前轮次是否有效
      if (currentRound > 0 && currentRound <= totalRounds) {
        const eventIndex = currentRound - 1;
        
        // 检查是否有对应的事件
        if (events[eventIndex]) {
          // 事件已存在，直接使用
          const event = events[eventIndex];
          console.log(`Using existing event for round ${currentRound}: ${event.city} (${event.year})`);
          
          setCurrentEvent(event);
          setGuessLocation(null);
          setSelectedYear(2000);
          setQuestionStartTime(Date.now());
          
          // 重置计时器到初始值并启动计时器
          const settings = PlayerSettingsManager.loadSettings();
          setTimeRemaining(settings.defaultTimeLimit || 120);
          setIsTimerStopped(false);
          setTimeWarning(false);
          console.log(`[UseExistingEvent] Timer reset to ${settings.defaultTimeLimit || 120} seconds for existing event`);
          
          // 延迟保存进度，避免循环依赖
          if (autoSaveEnabled) {
            const timer = setTimeout(() => {
              console.log('Auto-saving progress after question change');
              saveGameProgress();
            }, 1000);
            return () => clearTimeout(timer);
          }
        } else {
          // 事件未加载，强制按需加载
          console.log(`Event not loaded for round ${currentRound}, force loading...`);
          loadEventForCurrentRound();
        }
      }
    }
  }, [currentRound, gameState, isLoading, eventIds.length, totalRounds, autoSaveEnabled, events, loadEventForCurrentRound]); // 移除gameSessionId依赖

  // 时间倒计时 - 优化存储频率和依赖
  useEffect(() => {
    if (gameState === "guessing" && timeRemaining > 0 && !isTimerStopped) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          // 只在特定时间点保存进度，避免频繁写入
          if (autoSaveEnabled && (newTime % 10 === 0 || newTime <= 10)) {
            // 每10秒保存一次，或者最后10秒每秒保存
            setTimeout(() => saveGameProgress(), 100);
          }
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "guessing" && timeRemaining === 0 && !isTimerStopped) {
      // 时间到时显示警告，不自动提交
      setTimeWarning(true);
    }
  }, [timeRemaining, gameState, autoSaveEnabled, isTimerStopped]); // 添加isTimerStopped依赖

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
            {/* 时间警告提示 */}
            {timeWarning && (
              <div className="mb-2 p-3 bg-red-500 text-white rounded-lg text-center font-medium">
                ⏰ 时间已到！请尽快提交您的答案
              </div>
            )}
            {/* 提交错误处理选项 */}
            {submitError && (
              <div className="mb-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                <div className="text-red-700 text-center font-medium mb-2">
                  ❌ {submitError}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetrySubmit}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600"
                  >
                    🔄 重试提交
                  </button>
                  <button
                    onClick={handleSkipQuestion}
                    className="flex-1 px-3 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600"
                  >
                    ⏭️ 跳过题目
                  </button>
                </div>
              </div>
            )}
            <SubmitButton
              onSubmit={handleSubmitGuess}
              guessLocation={guessLocation}
              isMobile={true}
              isLoading={isSubmitting}
            />
          </div>

          {/* 地图容器和桌面端提交按钮的组合容器 */}
          <div className="absolute bottom-20 md:bottom-4 left-4 right-4 z-30 pointer-events-auto">
            {/* 桌面端提交按钮 - 位于地图上方 */}
            <div className="hidden md:flex flex-col items-center z-50 pointer-events-auto relative -bottom-6">
              {/* 时间警告提示 */}
              {timeWarning && (
                <div className="mb-2 p-3 bg-red-500 text-white rounded-lg text-center font-medium">
                  ⏰ 时间已到！请尽快提交您的答案
                </div>
              )}
              {/* 提交错误处理选项 */}
              {submitError && (
                <div className="mb-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <div className="text-red-700 text-center font-medium mb-2">
                    ❌ {submitError}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRetrySubmit}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600"
                    >
                      🔄 重试提交
                    </button>
                    <button
                      onClick={handleSkipQuestion}
                      className="flex-1 px-3 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600"
                    >
                      ⏭️ 跳过题目
                    </button>
                  </div>
                </div>
              )}
              <SubmitButton
                onSubmit={handleSubmitGuess}
                guessLocation={guessLocation}
                isLoading={isSubmitting}
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
