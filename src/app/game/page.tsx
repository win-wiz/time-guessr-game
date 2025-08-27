"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { GameImage } from "@/components/game-image";

// Import split components
import { BackgroundImage } from "@/components/game/background-image";
import { GameHeader } from "@/components/game/game-header";
// import { MobileInfoPanel, YearControlBar } from "@/components/game/mobile-info-panel";
import { DesktopStatusPanel, YearSelector } from "@/components/game/desktop-status-panel";
import { GameHint } from "@/components/game/game-hint";
import { SubmitButton } from "@/components/game/submit-button";
import { MapContainer } from "@/components/game/map-container";
import { GameSummaryPage } from "@/components/game/game-summary-page";
import { LoadingState } from "@/components/game/loading-state";
import { EventDetailPanel } from "@/components/game/event-detail";

// Import unified API service
import { 
  GameAPIService, 
  EventDetail 
} from "@/lib/api-service";

// Import local storage service
import {
  GameProgressManager,
  PlayerSettingsManager,
  GameProgress,
  GameScore,
  checkStorageSpace
} from "@/lib/local-storage";

// Import round manager
import { loadResumeInfo } from "@/lib/game-round-manager";
import { currentMaxYear } from "@/lib/utils";

const currentYear = new Date().getFullYear();

// Memoized Game component for performance optimization
const Game = React.memo(() => {
  const router = useRouter();
  
  // Game session state
  const [gameSessionId, setGameSessionId] = useState<string>("");
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [questionSessionIds, setQuestionSessionIds] = useState<string[]>([]);
  
  // Game progress state
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [currentEvent, setCurrentEvent] = useState<EventDetail | null>(null);
  
  // User input state
  const [guessLocation, setGuessLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedYear, setSelectedYear] = useState(1950);
  
  // Game state
  const [gameState, setGameState] = useState<"loading" | "guessing" | "summary">("loading");
  const [timeRemaining, setTimeRemaining] = useState(120); // Default 120 seconds
  const [timeWarning, setTimeWarning] = useState<boolean>(false); // Time warning state
  const [isTimerStopped, setIsTimerStopped] = useState(false); // Control timer stop state
  const [submitError, setSubmitError] = useState<string | null>(null); // Submit error state
  const [isMapExpanded, setIsMapExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Submitting state
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  // const [isEventDetailExpanded, setIsEventDetailExpanded] = useState(false); // Event detail expansion state
  
  // Game scores (using local storage type)
  const [scores, setScores] = useState<GameScore[]>([]);
  
  // Local storage related state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasStoredProgress, setHasStoredProgress] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Clear saved progress
  const clearSavedProgress = useCallback(() => {
    GameProgressManager.clearProgress();
    setHasStoredProgress(false);
  }, []);

  // Network status detection
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
     const handleOnline = () => {
       setIsOnline(true);
       // When network is restored, if there's an error state, prompt user to retry
       if (error && error.includes('Network')) {
         setError(null);
         if (confirm('Network connection restored. Would you like to retry?')) {
           if (gameState === 'loading') {
             // Delay calling initializeGame to avoid dependency issues
             setTimeout(() => {
               window.location.reload();
             }, 100);
           }
         }
       }
     };
     
     const handleOffline = () => {
       setIsOnline(false);
       setError('Network connection lost. Please check your connection.');
     };
     
     window.addEventListener('online', handleOnline);
     window.addEventListener('offline', handleOffline);
     
     return () => {
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
     };
   }, [error, gameState]);
  
  // Generic retry function with network status check
  const retryWithBackoff = useCallback(async (
    operation: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check network status
        if (!navigator.onLine) {
          throw new Error('Network connection unavailable');
        }
        
        return await operation();
      } catch (error) {
        
        if (attempt === maxRetries) {
          // Last retry failed, throw more specific error based on error type
          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch') || !navigator.onLine) {
              throw new Error('Network connection failed. Please check your network and try again.');
            }
          }
          throw error;
        }
        
        // Exponential backoff delay
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }, []);

  // Load game progress
  const loadGameProgress = useCallback(() => {
    const savedProgress = GameProgressManager.loadProgress();
    if (!savedProgress) {
      return false;
    }



    // Validate required data
    if (!savedProgress.gameSessionId || !savedProgress.eventIds || savedProgress.eventIds.length === 0) {
      GameProgressManager.clearProgress();
      return false;
    }

    // Restore complete game state
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

    return true;
  }, []);

  // Use useRef to store latest state, avoid frequent recreation due to too many useCallback dependencies
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

  // Update state in ref - add debug logs
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
    

    
    gameStateRef.current = newState;
  });

  // Save game progress - optimize dependencies, avoid circular dependencies
  const saveGameProgress = useCallback(() => {
    const state = gameStateRef.current;
    

    
    if (!state.gameSessionId || !state.eventIds || state.eventIds.length === 0) {
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

      // Use debounce mechanism to avoid too frequent saves
      GameProgressManager.saveProgress(progress);
      
      // Check storage space
      const storageInfo = checkStorageSpace();
      if (!storageInfo.hasSpace) {
        // Storage space is running low
      }
      
    } catch (error) {
      // Failed to save game progress
    }
  }, []); // Remove all dependencies, use ref to get latest state

  // Initialize game - refactored according to documentation requirements
  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setGameState("loading");
      setError(null);
      
      // Check for saved progress - directly check localStorage, not dependent on hasStoredProgress state
      const hasProgress = GameProgressManager.hasProgress();
      
      if (hasProgress) {
        const loaded = loadGameProgress();
        if (loaded) {
          return; // Successfully loaded saved progress
        }
        GameProgressManager.clearProgress();
      }
      
      // Load player settings
      const settings = PlayerSettingsManager.loadSettings();
      setAutoSaveEnabled(settings.autoSave);
      
      // Check storage space
      const storageInfo = checkStorageSpace();
      if (!storageInfo.hasSpace) {
        setError('Insufficient storage space, some features may not work properly');
      }
      
      // 1. Call /game/start to get game session ID, currentRound and game eventIds
      const gameResponse = await retryWithBackoff(async () => {
        return await GameAPIService.startGame({
          gameMode: settings.defaultGameMode,
          questionCount: settings.defaultQuestionCount,
          timeLimit: settings.defaultTimeLimit
        });
      });

      const { gameSessionId, eventIds, currentQuestion, totalQuestions, timeLimit } = gameResponse;

      // Set basic game state
      setGameSessionId(gameSessionId);
      setEventIds(eventIds);
      setCurrentRound(currentQuestion);
      setTotalRounds(totalQuestions);
      setTimeRemaining(timeLimit || settings.defaultTimeLimit);
      setGameStartTime(Date.now());
      setScores([]); // Initialize scores array
      
      // 2. Get current question eventId based on currentRound
      const currentEventId = eventIds[currentQuestion - 1];
      if (!currentEventId) {
        throw new Error(`No eventId found for round ${currentQuestion}`);
      }
      
      // 3. Load event details for current round on demand
      
      // First check if the event is in cache
      let currentEventDetail: EventDetail;
      
      try {
        currentEventDetail = await retryWithBackoff(async () => {
          return await GameAPIService.getEventDetail(currentEventId);
        });
        
        if (!currentEventDetail) {
          throw new Error('Unable to load event details');
        }
        
      } catch (error) {
        throw new Error(`Failed to load question ${currentQuestion}`);
      }
      
      // Initialize events array, only set current event
      const initialEvents: EventDetail[] = new Array(eventIds.length);
      initialEvents[currentQuestion - 1] = currentEventDetail;
      
      setEvents(initialEvents);
      setCurrentEvent(currentEventDetail);
      setIsLoading(false);
      setGameState("guessing");
      setQuestionStartTime(Date.now());
      
      // Preload next event (async execution, non-blocking)
      setTimeout(() => {
        preloadNextEvent();
      }, 1000);
      
      // 4. Auto-save initial progress
      if (settings.autoSave) {
        setTimeout(() => saveGameProgress(), 1000);
      }
      
    } catch (error) {
      
      // Provide more specific error messages and handling based on error type
      let errorMessage = 'Game initialization failed';
      let showRetry = true;
      
      if (error instanceof Error) {
        if (error.message.includes('网络') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network connection failed, please check your network and try again';
        } else if (error.message.includes('事件') || error.message.includes('Event')) {
          errorMessage = 'Failed to load game content, please try again';
        } else if (error.message.includes('存储') || error.message.includes('Storage')) {
          errorMessage = 'Local storage error, please clear browser cache and try again';
          showRetry = false;
        } else {
          errorMessage = `Initialization failed: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      // Decide whether to auto-retry based on error type
      if (showRetry) {
        setTimeout(() => {
          if (confirm(`${errorMessage}\n\nWould you like to retry?`)) {
            setError(null);
            setIsLoading(true);
            initializeGame();
          }
        }, 1950);
      }
    }
  }, [hasStoredProgress, loadGameProgress, retryWithBackoff]); // Add retryWithBackoff dependency

  // Use useCallback to optimize event handlers - optimize dependencies
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (gameState === "guessing") {
      setGuessLocation({ lat, lng });
      // Auto-save progress with optimized timing
      if (autoSaveEnabled) {
        // Use requestIdleCallback for better performance during submission
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => saveGameProgress(), { timeout: 3000 });
        } else {
          setTimeout(() => saveGameProgress(), 300);
        }
      }
    }
  }, [gameState, autoSaveEnabled]); // Remove saveGameProgress dependency

  const handleYearChange = useCallback((year: number) => {
    setSelectedYear(year);
    // Auto-save progress
    if (autoSaveEnabled) {
      saveGameProgress();
    }
  }, [autoSaveEnabled]); // Remove saveGameProgress dependency

  const handleNextRound = useCallback(() => {
    
    if (currentRound < totalRounds && eventIds.length >= totalRounds) {
      const nextRound = currentRound + 1;
      
      // Clear current event to avoid displaying wrong event
      setCurrentEvent(null);
      setGuessLocation(null);
      setSelectedYear(1950);
      
      // Update round, useEffect will handle loading next event on demand
      setCurrentRound(nextRound);
      
      // Immediately update and save progress
      const updatedProgress: GameProgress = {
        gameSessionId,
        currentRound: nextRound, // Use new round number
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
      
    } else {
      // All questions completed, go to summary page
      setGameState("summary");
      clearSavedProgress();
    }
  }, [currentRound, totalRounds, eventIds.length, clearSavedProgress, gameSessionId, timeRemaining, eventIds, events, scores, questionSessionIds, gameStartTime]);

  // Unified error clearing function
  const clearErrors = useCallback(() => {
    setSubmitError(null);
    setError(null);
  }, []);

  const handleSubmitGuess = useCallback(async () => {
    if (!currentEvent || !guessLocation || !gameSessionId) {
      return;
    }

    try {
      // Stop timer
      setIsTimerStopped(true);
      
      setIsSubmitting(true);
      clearErrors();
      setTimeWarning(false);
      
      // Calculate answer time (seconds)
      const answerTime = questionStartTime > 0 ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;
      
      // 4. After user submits answer, call /game/submit to submit answer
      const submitResponse = await retryWithBackoff(async () => {
        return await GameAPIService.submitAnswer({
          gameSessionId,
          eventId: currentEvent.id,
          guessedYear: selectedYear,
          guessedLocation: guessLocation,
          answerTime
        });
      });



      // Save questionSessionId
      setQuestionSessionIds(prev => [...prev, submitResponse.questionSessionId]);
      
      // Immediately get results and update scores
      try {
        const questionResult = await GameAPIService.getQuestionResult(submitResponse.questionSessionId);
        
        // Build new score object
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
        
        // Update scores state
        setScores(prev => {
          const updatedScores = [...prev, newScore];
          return updatedScores;
        });
      } catch (error) {
        // Failed to fetch question result for immediate score update
      }
      
      // Auto-save progress
      if (autoSaveEnabled) {
        saveGameProgress();
      }

      // 5. After interface returns, call /game/result/{gameSessionId} to get game results (handled in result page)
      // 6. In game result page, click continue game, return to game page, currentRound increments by one
      
      // Check if game is completed
      if (submitResponse.status === 'completed') {
        // 8. When currentRound equals total game rounds, game ends
        clearSavedProgress();
        
        // Navigate to final result page
        router.push(`/game/result?gameSessionId=${gameSessionId}&questionSessionId=${submitResponse.questionSessionId}&status=${submitResponse.status}&currentRound=${currentRound}`);
      } else {
        // Navigate to current question result page, user can choose to continue to next question
        router.push(`/game/result?gameSessionId=${gameSessionId}&questionSessionId=${submitResponse.questionSessionId}&status=${submitResponse.status}&currentRound=${currentRound}&totalRounds=${totalRounds}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
      setSubmitError(errorMessage);
      setError(errorMessage);
      
      // Show error message, let user choose to retry or skip
      setTimeout(() => {
        clearErrors();
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentEvent, guessLocation, selectedYear, gameSessionId, questionStartTime, currentRound, totalRounds, router, autoSaveEnabled, retryWithBackoff, clearSavedProgress, clearErrors]);

  // Preload next question event (improve user experience)
  const preloadNextEvent = useCallback(async () => {
    if (!eventIds || currentRound >= totalRounds) return;
    
    const nextEventId = eventIds[currentRound]; // currentRound starts from 1, so next question index is currentRound
    if (!nextEventId) return;
    
    try {
      const eventDetail = await GameAPIService.getEventDetail(nextEventId);
    } catch (error) {
      // Failed to preload next event
    }
  }, [eventIds, currentRound, totalRounds]);
  
  // Retry submit function
  const handleRetrySubmit = useCallback(() => {
    clearErrors();
    handleSubmitGuess();
  }, [clearErrors, handleSubmitGuess]);

  // Skip current question function
  const handleSkipQuestion = useCallback(() => {
    clearErrors();
    handleNextRound();
  }, [clearErrors, handleNextRound]);

  // Unified state restoration function
  const restoreGameState = useCallback(async (progress: GameProgress, targetRound?: number) => {
    
    const roundToLoad = targetRound || progress.currentRound;
    
    // Restore basic state
    setGameSessionId(progress.gameSessionId);
    setCurrentRound(roundToLoad);
    setTotalRounds(progress.totalRounds);
    setTimeRemaining(progress.timeRemaining);
    setEventIds(progress.eventIds);
    setEvents(progress.events);
    setQuestionSessionIds(progress.questionSessionIds);
    setGameStartTime(progress.startTime);
    
    // If returning from result page, check if scores need to be updated
    let updatedScores = progress.scores;
    if (targetRound && targetRound > progress.currentRound) {
      // Returning from result page, need to get previous question result and update scores
      const previousRound = targetRound - 1;
      const previousQuestionSessionId = progress.questionSessionIds[previousRound - 1];
      
      if (previousQuestionSessionId && previousRound > progress.scores.length) {
        try {
          const questionResult = await GameAPIService.getQuestionResult(previousQuestionSessionId);
          
          // Build new score object
          const newScore: GameScore = {
            score: questionResult.scoringDetails.finalScore,
            distance: 0, // These fields may not be needed in current implementation, but required by interface
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
        } catch (error) {
          // Failed to fetch question result for score update
        }
      }
    }
    
    setScores(updatedScores);
    
    // Check if game is completed
    if (roundToLoad > progress.totalRounds) {
      setGameState("summary");
      setIsLoading(false);
      return;
    }
    
    // Load current round event
    try {
      setIsLoading(true);
      const eventIndex = roundToLoad - 1;
      const eventId = progress.eventIds[eventIndex];
      
      if (!eventId) {
        throw new Error(`No eventId found for round ${roundToLoad}`);
      }
      
      const eventDetail = await GameAPIService.getEventDetail(eventId);

      
      // Update current event
      setCurrentEvent(eventDetail);
      setGuessLocation(null);
      setSelectedYear(1950);
      setQuestionStartTime(Date.now());
      
      // Reset timer to initial value and start timer
      const settings = PlayerSettingsManager.loadSettings();
      setTimeRemaining(settings.defaultTimeLimit || 120);
      setIsTimerStopped(false);
      setTimeWarning(false);

      
      setGameState("guessing");
      setIsLoading(false);
      
      // Save updated progress
      const updatedProgress = { ...progress, currentRound: roundToLoad, scores: updatedScores };
      GameProgressManager.saveProgress(updatedProgress);
      
    } catch (error) {

      setError(`Failed to load question ${roundToLoad}`);
      setIsLoading(false);
    }
  }, []);

  const handlePlayAgain = useCallback(() => {
    // Clear saved progress
    clearSavedProgress();
    
    // Reset all states
    setGameSessionId("");
    setEventIds([]);
    setEvents([]);
    setQuestionSessionIds([]);
    setCurrentRound(1);
    setScores([]);
    setGuessLocation(null);
    setSelectedYear(1950);
    setGameState("loading");
    setIsLoading(true);
    setQuestionStartTime(0);
    setGameStartTime(0);
    setError(null);
    
    // Restart game
    initializeGame();
  }, [clearSavedProgress, initializeGame]);

  const toggleMapExpanded = useCallback(() => {
    setIsMapExpanded(prev => !prev);
  }, []);

  // Use useMemo to optimize calculated values
  const totalScore = useMemo(() => 
    scores.reduce((sum, round) => sum + round.score, 0), 
    [scores]
  );

  // Page initialization - check and restore saved game state
  useEffect(() => {
    const initializePage = async () => {
      try {

        
        // Check if force reload is needed
        const forceReload = sessionStorage.getItem('force_reload_game');
        if (forceReload) {
          sessionStorage.removeItem('force_reload_game');

        }
        
        // First check if returning from result page
        const urlParams = new URLSearchParams(window.location.search);
        const resumeFlag = urlParams.get('resume');
        const gameSessionIdParam = urlParams.get('gameSessionId');
        const roundParam = urlParams.get('round');
        // const totalRoundsParam = urlParams.get('totalRounds');
        
        // Use round manager to check resume info
        const resumeInfo = loadResumeInfo();
        

        
        // If returning from result page, prioritize using resume info
        if (resumeFlag === 'true' && (resumeInfo || (gameSessionIdParam && roundParam))) {
          const targetGameSessionId = resumeInfo?.gameSessionId || gameSessionIdParam;
          const targetRound = resumeInfo?.nextRound || parseInt(roundParam || '1');
          const targetTotalRounds = resumeInfo?.totalRounds || 5;
          

          
          // Check if there's matching saved progress
          const savedProgress = GameProgressManager.loadProgress();
          if (savedProgress && savedProgress.gameSessionId === targetGameSessionId) {

            
            // Update round info
            const updatedProgress = {
              ...savedProgress,
              currentRound: targetRound,
              totalRounds: targetTotalRounds
            };
            
            // Use unified restoration function
            await restoreGameState(updatedProgress, targetRound);
            return;
          } else {

          }
        }
        
        // 检查本地存储的游戏进度
        const hasProgress = GameProgressManager.hasProgress();

        setHasStoredProgress(hasProgress);
        
        // Load player settings
        const settings = PlayerSettingsManager.loadSettings();
        setAutoSaveEnabled(settings.autoSave);
        setSelectedYear(1950); // 重置为默认值
        
        if (hasProgress) {

          // 直接调用loadGameProgress而不是restoreGameState
          const loaded = loadGameProgress();
          if (!loaded) {

            await initializeGame();
          } else {

          }
        } else {

          await initializeGame();
        }
      } catch (error) {

        setError('Page initialization failed, please refresh and retry');
        setIsLoading(false);
      }
    };
    
    initializePage();
   }, [initializeGame, loadGameProgress]); // Add necessary dependencies

  // Auto-save progress - optimize with longer intervals and idle callback
  useEffect(() => {
    if (!autoSaveEnabled || gameState !== "guessing") return;

    const autoSaveInterval = setInterval(() => {
      // Use requestIdleCallback for better performance when available
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => saveGameProgress(), { timeout: 5000 });
      } else {
        saveGameProgress();
      }
    }, 45000); // Increase interval to 45 seconds for better performance

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, gameState]); // Remove saveGameProgress dependency

  // Save progress when page unloads - optimize dependencies
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
  }, []); // Remove all dependencies, use ref to get state

  // Load event details for current round - on-demand loading version (enhanced error handling)
  const loadEventForCurrentRound = useCallback(async () => {
    const state = gameStateRef.current;
    if (!state.eventIds.length || state.currentRound <= 0 || state.currentRound > state.eventIds.length) {

      return;
    }
    
    try {
      setIsLoading(true);
      const eventId = state.eventIds[state.currentRound - 1];

      
      // Use retry mechanism to get event data from API
      const eventDetail = await retryWithBackoff(async () => {
        return await GameAPIService.getEventDetail(eventId);
      });

      
      // 更新events数组，只在对应位置设置事件
      setEvents(prevEvents => {
        const newEvents = [...prevEvents];
        newEvents[state.currentRound - 1] = eventDetail;

        return newEvents;
      });
      
      // 直接设置当前事件
      setCurrentEvent(eventDetail);
      setGuessLocation(null);
      setSelectedYear(1950);
      setQuestionStartTime(Date.now());
      
      // 重置计时器到初始值并启动计时器
      const settings = PlayerSettingsManager.loadSettings();
      setTimeRemaining(settings.defaultTimeLimit || 120);
      setIsTimerStopped(false);
      setTimeWarning(false);

      
      setGameState("guessing");
      setIsLoading(false);
      
      // Save updated progress with optimized timing
      if (autoSaveEnabled) {
        // Use requestIdleCallback for better performance, fallback to shorter timeout
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => {

            saveGameProgress();
          }, { timeout: 1950 });
        } else {
          setTimeout(() => {

            saveGameProgress();
          }, 500);
        }
      }
      

      
    } catch (error) {

      setError(`Failed to load question ${state.currentRound}, please check network connection and retry`);
      setIsLoading(false);
    }
  }, [autoSaveEnabled, retryWithBackoff]); // 大幅简化依赖项

  // Optimized question switching logic - load events on demand, optimize dependencies
  useEffect(() => {
    if (gameState === "guessing" && !isLoading && eventIds.length > 0) {
      // 检查当前轮次是否有效
      if (currentRound > 0 && currentRound <= totalRounds) {
        const eventIndex = currentRound - 1;
        
        // 检查是否有对应的事件
        if (events[eventIndex]) {
          // 事件已存在，直接使用
          const event = events[eventIndex];


          setCurrentEvent(event);
          setGuessLocation(null);
          setSelectedYear(1950);
          setQuestionStartTime(Date.now());
          
          // 重置计时器到初始值并启动计时器
          const settings = PlayerSettingsManager.loadSettings();
          setTimeRemaining(settings.defaultTimeLimit || 120);
          setIsTimerStopped(false);
          setTimeWarning(false);

          
          // 延迟保存进度，避免循环依赖
          if (autoSaveEnabled) {
            const timer = setTimeout(() => {

              saveGameProgress();
            }, 1000);
            return () => clearTimeout(timer);
          }
        } else {
          // Event not loaded, force on-demand loading

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
          // Batch state updates and reduce save frequency for better performance
          if (autoSaveEnabled && (newTime % 15 === 0 || newTime <= 5)) {
            // Save every 15 seconds, or every second in the last 5 seconds
            // Use requestIdleCallback for better performance when available
            if (typeof requestIdleCallback !== 'undefined') {
              requestIdleCallback(() => saveGameProgress(), { timeout: 1000 });
            } else {
              setTimeout(() => saveGameProgress(), 200);
            }
          }
          return newTime;
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "guessing" && timeRemaining === 0 && !isTimerStopped) {
      // Show warning when time is up, don't auto-submit
      setTimeWarning(true);
    }
  }, [timeRemaining, gameState, autoSaveEnabled, isTimerStopped]); // 添加isTimerStopped依赖

  // If loading, show loading state
  if (gameState === "loading" || isLoading) {
    return (
      <LoadingState 
        currentRound={currentRound}
        totalRounds={totalRounds}
        scores={scores}
      />
    );
  }

  return (
    <main className="h-screen bg-black text-white flex flex-col relative md:overflow-hidden">
      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* 背景图片 */}
      {currentEvent && <BackgroundImage imageUrl={currentEvent.imageUrl || currentEvent.image_url || ''} />}

      {/* 游戏头部 */}
      <GameHeader
        currentRound={currentRound}
        totalRounds={totalRounds}
        scores={scores}
        timeRemaining={timeRemaining}
        onSettingsChange={() => {
          // Reload settings
          const newSettings = PlayerSettingsManager.loadSettings();
          setAutoSaveEnabled(newSettings.autoSave);
          // 可以在这里添加其他设置变更的处理逻辑
        }}
      />
      
      {gameState === "guessing" && currentEvent && (
        <div className="relative z-10 flex-1">
          {/* Mobile layout - 整页滚动设计 */}
          <div className="md:hidden h-full pointer-events-auto">
            {/* 滚动内容区域 - 添加顶部间距避免被固定头部遮挡 */}
            <div className="h-full overflow-y-auto overscroll-y-contain pt-20 md:pt-0">
              <div className="min-h-screen flex flex-col pb-safe">

                {/* 图片区域 */}
                <div className="flex-shrink-0 p-3 pointer-events-auto">
                  <div className="aspect-[4/3] w-full relative">
                    <GameImage 
                      imageUrl={currentEvent.imageUrl || currentEvent.image_url || ''} 
                      eventName={currentEvent.description || ''}
                    />
                    {/* 移动端详细信息 - 悬浮在图片上 */}
                    {currentEvent.event_descript && (
                      <div className="absolute -bottom-28 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3">
                        <EventDetailPanel 
                          eventDetail={currentEvent.event_descript}
                          className="text-xs"
                          maxLines={3}
                          expandThreshold={100}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 控制区域 */}
                <div className="flex-1 bg-slate-900/95 backdrop-blur-sm pointer-events-auto mt-28">
                    
                    {/* 地图区域 - 纯净版 */}
                    <div className="rounded-lg overflow-hidden">
                      <MapContainer
                        onMapClick={handleMapClick}
                        guessLocation={guessLocation}
                        isMapExpanded={isMapExpanded}
                        onToggleExpanded={toggleMapExpanded}
                      />
                    </div>

                    <div className="p-4 space-y-4">
                      {/* 年份选择器 - 与桌面端一致的样式 */}
                      <div className="bg-gradient-to-br from-slate-900/80 via-gray-800/70 to-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl">
                        <div className="flex items-center gap-4">
                          {/* 年份标签和显示 */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-400/40">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <div className="text-lg font-bold text-white">{selectedYear}</div>
                              <div className="text-xs text-gray-300">Select Year</div>
                            </div>
                          </div>
                          
                          {/* 滑块区域 */}
                          <div className="flex-1">
                            <input
                              type="range"
                              min={1900}
                              max={currentMaxYear}
                              value={selectedYear}
                              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-600/60 rounded-full appearance-none cursor-pointer accent-blue-500 mb-1"
                              style={{
                                WebkitAppearance: 'none',
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((selectedYear - 1900) / (currentMaxYear - 1900)) * 100}%, #4b5563 ${((selectedYear - 1900) / (currentMaxYear - 1900)) * 100}%, #4b5563 100%)`
                              }}
                            />
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>1900</span>
                              <span>{currentMaxYear}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/* 警告和错误信息 */}
                    {timeWarning && (
                      <div className="p-3 bg-red-500/90 text-white rounded-lg text-center text-sm">
                        ⏰ Time's up! Please submit your answer
                      </div>
                    )}
                    {submitError && (
                      <div className="p-3 bg-red-100/90 border border-red-300/50 rounded-lg">
                        <div className="text-red-700 text-center text-sm mb-2">
                          ❌ {submitError}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRetrySubmit}
                            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium"
                          >
                            🔄 Retry
                          </button>
                          <button
                            onClick={handleSkipQuestion}
                            className="flex-1 px-3 py-2 bg-gray-500 text-white rounded text-sm font-medium"
                          >
                            ⏭️ Skip
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* 提交按钮 */}
                    <div className="pb-4">
                      <SubmitButton
                        onSubmit={handleSubmitGuess}
                        guessLocation={guessLocation}
                        isMobile={true}
                        isLoading={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop layout - 新的两列布局 */}
          <div className="hidden md:block">
            {/* 两列布局容器 */}
            <div className="absolute top-8 left-4 right-4 bottom-4 flex gap-6 z-20 pointer-events-auto">
              {/* 左列 - 图片和详细信息区域 */}
              <div className="sm:1/2 md:w-3/5 relative" style={{height: 'calc(100vh - 250px)'}}>
                {/* 图片区域 */}
                <div className="h-full overflow-hidden rounded-xl">
                  <GameImage 
                    imageUrl={currentEvent.imageUrl || currentEvent.image_url || ''} 
                    eventName={currentEvent.description || ''}
                  />
                </div>
                
                {/* 详细信息区域 - 浮动在图片下方 */}
                {currentEvent.event_descript && (
                  <div className="absolute -bottom-14 left-2 right-2">
                    <EventDetailPanel 
                       eventDetail={currentEvent.event_descript}
                       className="text-sm"
                       maxLines={2}
                       expandThreshold={150}
                     />
                  </div>
                )}
              </div>

              {/* 右列 - 交互控制区域 */}
              <div className="sm:1/2 md:w-2/5 flex flex-col">
                
                {/* 游戏提示 */}
                <div className="mb-3">
                  <GameHint
                    eventName={currentEvent.description || ''}
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                  />
                </div>

                {/* 状态面板 - 时间和位置信息 */}
                <div className="mb-3">
                  <DesktopStatusPanel
                    timeRemaining={timeRemaining}
                    guessLocation={guessLocation}
                  />
                </div>

                {/* 地图区域 - 占据主要空间 */}
                <div className=" rounded-xl overflow-hidden border-2 border-white/30 shadow-xl bg-black/20 backdrop-blur-sm mb-3">
                  <MapContainer
                    onMapClick={handleMapClick}
                    guessLocation={guessLocation}
                    isMapExpanded={isMapExpanded}
                    onToggleExpanded={toggleMapExpanded}
                  />
                </div>

                {/* 底部控制区域 - 年份选择和提交 */}
                <div className="space-y-3 flex-shrink-0">
                  {/* 年份选择器 */}
                  <YearSelector
                    selectedYear={selectedYear}
                    onYearChange={handleYearChange}
                    currentYear={currentYear}
                  />
                  
                  {/* 操作区域 */}
                  <div className="space-y-2">
                  {/* 警告和错误信息 */}
                  {timeWarning && (
                    <div className="p-2.5 bg-red-500/95 backdrop-blur-md text-white rounded-lg text-center font-medium border border-red-300 shadow-lg text-sm">
                      ⏰ Time's up! Please submit your answer as soon as possible
                    </div>
                  )}
                  {submitError && (
                    <div className="p-2.5 bg-red-50/95 backdrop-blur-md border border-red-300 rounded-lg shadow-lg">
                      <div className="text-red-700 text-center font-medium mb-2 text-sm">
                        ❌ {submitError}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRetrySubmit}
                          className="flex-1 px-2.5 py-1.5 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-all duration-200 shadow-md"
                        >
                          🔄 Retry
                        </button>
                        <button
                          onClick={handleSkipQuestion}
                          className="flex-1 px-2.5 py-1.5 bg-gray-500 text-white rounded text-sm font-medium hover:bg-gray-600 transition-all duration-200 shadow-md"
                        >
                          ⏭️ Skip
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* 提交按钮 - 突出显示 */}
                  <SubmitButton
                    onSubmit={handleSubmitGuess}
                    guessLocation={guessLocation}
                    isLoading={isSubmitting}
                  />
                  </div>
                </div>
              </div>
            </div>
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
});

export default Game;
