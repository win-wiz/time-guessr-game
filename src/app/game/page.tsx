"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { GameImage } from "@/components/game-image";

// Import split components
import { BackgroundImage } from "@/components/game/background-image";
import { GameHeader } from "@/components/game/game-header";
import { MobileInfoPanel } from "@/components/game/mobile-info-panel";
import { DesktopStatusPanel } from "@/components/game/desktop-status-panel";
import { GameHint } from "@/components/game/game-hint";
import { SubmitButton } from "@/components/game/submit-button";
import { MapContainer } from "@/components/game/map-container";
import { GameSummaryPage } from "@/components/game/game-summary-page";
import { LoadingState } from "@/components/game/loading-state";

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
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Submitting state
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
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
       console.log('[Network] Connection restored');
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
       console.log('[Network] Connection lost');
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
        
        console.log(`Attempt ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
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
        console.log(`Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }, []);

  // Load current question - on-demand loading version with enhanced error handling
  // const loadCurrentQuestion = useCallback(async (savedProgress: GameProgress) => {
  //   try {
  //     setIsLoading(true);
  //     console.log(`[LoadQuestion] Starting load for round ${savedProgress.currentRound}`);
      
  //     // Check if there are more questions
  //     if (savedProgress.currentRound > savedProgress.totalRounds) {
  //       console.log('[LoadQuestion] All questions completed, going to summary');
  //       setGameState("summary");
  //       setIsLoading(false);
  //       return;
  //     }
      
  //     // Only load current needed event, not all events
  //     const currentEventIndex = savedProgress.currentRound - 1;
  //     let currentEvent: EventDetail | null = null;
      
  //     // Check if current event is already saved
  //     if (savedProgress.events[currentEventIndex]) {
  //       currentEvent = savedProgress.events[currentEventIndex];
  //       console.log(`[LoadQuestion] Using cached event: ${currentEvent!.city} (${currentEvent!.year})`);
  //     } else {
  //       // Load current event on-demand with retry mechanism
  //       const eventId = savedProgress.eventIds[currentEventIndex];
  //       console.log(`[LoadQuestion] Loading event ${eventId} for round ${savedProgress.currentRound}`);
        
  //       try {
  //         currentEvent = await retryWithBackoff(async () => {
  //           return await GameAPIService.getEventDetail(eventId);
  //         });
          
  //         if (!currentEvent) {
  //           throw new Error('Event details are empty');
  //         }
          
  //         console.log(`[LoadQuestion] Successfully loaded event: ${currentEvent.city} (${currentEvent.year})`);
  //       } catch (error) {
  //         console.error(`[LoadQuestion] Failed to load event ${eventId} after retries:`, error);
  //         setError(`Failed to load question ${savedProgress.currentRound}. Please check your network connection and try again.`);
  //         setIsLoading(false);
  //         return;
  //       }
  //     }
      
  //     // Check if currentEvent is null
  //     if (!currentEvent) {
  //       console.error('[LoadQuestion] Current event is null after loading');
  //       setError('Failed to load question data');
  //       setIsLoading(false);
  //       return;
  //     }
      
  //     // Initialize events array, only set current event
  //     const eventsArray: EventDetail[] = new Array(savedProgress.eventIds.length);
  //     eventsArray[currentEventIndex] = currentEvent;
      
  //     // Copy other saved events if any
  //     savedProgress.events.forEach((event, index) => {
  //       if (event && index !== currentEventIndex) {
  //         eventsArray[index] = event;
  //       }
  //     });
      
  //     setEvents(eventsArray);
  //     setCurrentEvent(currentEvent);
      
  //     // Reset timer to initial value and start timer
  //     const settings = PlayerSettingsManager.loadSettings();
  //     setTimeRemaining(settings.defaultTimeLimit || 120);
  //     setIsTimerStopped(false);
  //     setTimeWarning(false);
  //     console.log(`[LoadQuestion] Timer reset to ${settings.defaultTimeLimit || 120} seconds for new question`);
      
  //     setIsLoading(false);
  //     setGameState("guessing");
  //     setQuestionStartTime(Date.now());
  //     console.log(`[LoadQuestion] Successfully loaded round ${savedProgress.currentRound}`);
      
  //   } catch (error) {
  //     console.error('[LoadQuestion] Unexpected error:', error);
  //     setError('An unexpected error occurred while loading the question');
  //     setIsLoading(false);
  //   }
  // }, [retryWithBackoff]);

  // Load game progress
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

    // Validate required data
    if (!savedProgress.gameSessionId || !savedProgress.eventIds || savedProgress.eventIds.length === 0) {
      console.error('[LoadProgress] Invalid saved progress data, missing required fields');
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

    console.log('[LoadProgress] Game progress loaded successfully');
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
    
    // Simplified debug logs
    if (prevState.currentRound !== newState.currentRound) {
      console.log(`Round: ${prevState.currentRound} → ${newState.currentRound}`);
    }
    if (prevState.gameState !== newState.gameState) {
      console.log(`State: ${prevState.gameState} → ${newState.gameState}`);
    }
    if (prevState.scores.length !== newState.scores.length) {
      console.log(`[GameStateRef] Scores count: ${prevState.scores.length} → ${newState.scores.length}`);
      console.log(`[GameStateRef] Total score: ${newState.scores.reduce((sum, s) => sum + s.score, 0)}`);
    }
    
    gameStateRef.current = newState;
  });

  // Save game progress - optimize dependencies, avoid circular dependencies
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

      // Use debounce mechanism to avoid too frequent saves
      GameProgressManager.saveProgress(progress);
      console.log(`[SaveProgress] Game progress saved successfully: Round ${state.currentRound}, Time remaining: ${state.timeRemaining}s`);
      
      // Check storage space
      const storageInfo = checkStorageSpace();
      if (!storageInfo.hasSpace) {
        console.warn('[SaveProgress] Storage space is running low');
      }
      
    } catch (error) {
      console.error('[SaveProgress] Failed to save game progress:', error);
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
      console.log('[GameInit] Checking for saved progress:', hasProgress);
      
      if (hasProgress) {
        const loaded = loadGameProgress();
        if (loaded) {
          console.log('[GameInit] Successfully loaded saved progress, skipping new game initialization');
          return; // Successfully loaded saved progress
        }
        console.log('[GameInit] Failed to load saved progress, clearing and starting new game');
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
      console.log(`[GameInit] Loading event detail for round ${currentQuestion}: ${currentEventId}`);
      
      // First check if the event is in cache
      let currentEventDetail: EventDetail;
      
      try {
        currentEventDetail = await retryWithBackoff(async () => {
          return await GameAPIService.getEventDetail(currentEventId);
        });
        
        if (!currentEventDetail) {
          throw new Error('Unable to load event details');
        }
        
        console.log(`[GameInit] Event loaded: ${currentEventDetail.city} (${currentEventDetail.year})`);
      } catch (error) {
        console.error(`[GameInit] Failed to load event ${currentEventId}:`, error);
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
      
      console.log(`[GameInit] Game initialization completed for round ${currentQuestion}`);
      
    } catch (error) {
      console.error('[GameInit] Initialize game error:', error);
      
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
    console.log(`=== HANDLE NEXT ROUND ===`);
    console.log(`Current round: ${currentRound}, Total rounds: ${totalRounds}`);
    console.log(`EventIds length: ${eventIds.length}`);
    
    if (currentRound < totalRounds && eventIds.length >= totalRounds) {
      const nextRound = currentRound + 1;
      console.log(`Advancing to round ${nextRound}`);
      
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
      console.log(`Progress saved with round ${nextRound}`);
      
    } else {
      // All questions completed, go to summary page
      console.log('All rounds completed, going to summary');
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
      console.warn('[SubmitGuess] Missing required data:', { currentEvent: !!currentEvent, guessLocation: !!guessLocation, gameSessionId: !!gameSessionId });
      return;
    }

    try {
      // Stop timer
      setIsTimerStopped(true);
      console.log('[SubmitGuess] Timer stopped due to answer submission');
      
      setIsSubmitting(true);
      clearErrors();
      setTimeWarning(false);
      
      console.log(`[SubmitGuess] Submitting answer for round ${currentRound}`);
      
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

      console.log(`[SubmitGuess] Answer submitted: questionSessionId=${submitResponse.questionSessionId}, status=${submitResponse.status}`);

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
          console.log('[ScoreUpdate] Previous scores:', prev);
          console.log('[ScoreUpdate] New score:', newScore);
          console.log('[ScoreUpdate] Updated scores array:', updatedScores);
          console.log('[ScoreUpdate] Total score now:', updatedScores.reduce((sum, s) => sum + s.score, 0));
          return updatedScores;
        });
      } catch (error) {
        console.error('Failed to fetch question result for immediate score update:', error);
      }
      
      // Auto-save progress
      if (autoSaveEnabled) {
        saveGameProgress();
      }

      // 5. After interface returns, call /game/result/{gameSessionId} to get game results (handled in result page)
      // 6. In game result page, click continue game, return to game page, currentRound increments by one
      
      // Check if game is completed
      if (submitResponse.status === 'completed') {
        console.log('[SubmitGuess] Game completed, navigating to final results');
        // 8. When currentRound equals total game rounds, game ends
        clearSavedProgress();
        
        // Navigate to final result page
        router.push(`/game/result?gameSessionId=${gameSessionId}&questionSessionId=${submitResponse.questionSessionId}&status=${submitResponse.status}&currentRound=${currentRound}`);
      } else {
        console.log('[SubmitGuess] Round completed, navigating to round results');
        // Navigate to current question result page, user can choose to continue to next question
        router.push(`/game/result?gameSessionId=${gameSessionId}&questionSessionId=${submitResponse.questionSessionId}&status=${submitResponse.status}&currentRound=${currentRound}&totalRounds=${totalRounds}`);
      }
    } catch (error) {
      console.error('[SubmitGuess] Error submitting guess:', error);
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
      console.log(`[PreloadEvent] Preloading next event: ${nextEventId}`);
      const eventDetail = await GameAPIService.getEventDetail(nextEventId);
      console.log(`[PreloadEvent] Next event preloaded: ${eventDetail.city}`);
    } catch (error) {
      console.warn(`[PreloadEvent] Failed to preload next event ${nextEventId}:`, error);
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
    console.log('Restoring game state:', { progress, targetRound });
    
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
          console.log(`Fetching result for previous round ${previousRound}, questionSessionId: ${previousQuestionSessionId}`);
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
          console.log('Updated scores with new result:', updatedScores);
        } catch (error) {
          console.error('Failed to fetch question result for score update:', error);
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
      console.log(`Loaded event for round ${roundToLoad}: ${eventDetail.city} (${eventDetail.year})`);
      
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
      console.log(`[RestoreGame] Timer reset to ${settings.defaultTimeLimit || 120} seconds for restored question`);
      
      setGameState("guessing");
      setIsLoading(false);
      
      // Save updated progress
      const updatedProgress = { ...progress, currentRound: roundToLoad, scores: updatedScores };
      GameProgressManager.saveProgress(updatedProgress);
      
    } catch (error) {
      console.error(`Error loading event for round ${roundToLoad}:`, error);
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
        console.log('[PageInit] Starting page initialization');
        
        // Check if force reload is needed
        const forceReload = sessionStorage.getItem('force_reload_game');
        if (forceReload) {
          sessionStorage.removeItem('force_reload_game');
          console.log('[PageInit] Force reload detected, clearing cache');
        }
        
        // First check if returning from result page
        const urlParams = new URLSearchParams(window.location.search);
        const resumeFlag = urlParams.get('resume');
        const gameSessionIdParam = urlParams.get('gameSessionId');
        const roundParam = urlParams.get('round');
        const totalRoundsParam = urlParams.get('totalRounds');
        
        // Use round manager to check resume info
        const resumeInfo = loadResumeInfo();
        
        console.log(`=== GAME PAGE INITIALIZATION ===`);
        console.log(`Resume flag: ${resumeFlag}`);
        console.log(`URL params - gameSessionId: ${gameSessionIdParam}, round: ${roundParam}, totalRounds: ${totalRoundsParam}`);
        console.log(`Resume info:`, resumeInfo);
        
        // If returning from result page, prioritize using resume info
        if (resumeFlag === 'true' && (resumeInfo || (gameSessionIdParam && roundParam))) {
          const targetGameSessionId = resumeInfo?.gameSessionId || gameSessionIdParam;
          const targetRound = resumeInfo?.nextRound || parseInt(roundParam || '1');
          const targetTotalRounds = resumeInfo?.totalRounds || 5;
          
          console.log(`=== RESUMING GAME FROM RESULT PAGE ===`);
          console.log(`Target sessionId: ${targetGameSessionId}, Target round: ${targetRound}, Total rounds: ${targetTotalRounds}`);
          
          // Check if there's matching saved progress
          const savedProgress = GameProgressManager.loadProgress();
          if (savedProgress && savedProgress.gameSessionId === targetGameSessionId) {
            console.log(`Found matching saved progress, updating round from ${savedProgress.currentRound} to ${targetRound}`);
            
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
            console.log(`No matching saved progress found for gameSessionId: ${targetGameSessionId}`);
          }
        }
        
        // 检查本地存储的游戏进度
        const hasProgress = GameProgressManager.hasProgress();
        console.log('[PageInit] Checking localStorage progress:', hasProgress);
        setHasStoredProgress(hasProgress);
        
        // Load player settings
        const settings = PlayerSettingsManager.loadSettings();
        setAutoSaveEnabled(settings.autoSave);
        setSelectedYear(1950); // 重置为默认值
        
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
      console.warn(`[LoadEvent] Invalid parameters: currentRound=${state.currentRound}, eventIds.length=${state.eventIds.length}`);
      return;
    }
    
    try {
      setIsLoading(true);
      const eventId = state.eventIds[state.currentRound - 1];
      console.log(`[LoadEvent] Starting load for round ${state.currentRound}, eventId: ${eventId}`);
      
      // Use retry mechanism to get event data from API
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
      setSelectedYear(1950);
      setQuestionStartTime(Date.now());
      
      // 重置计时器到初始值并启动计时器
      const settings = PlayerSettingsManager.loadSettings();
      setTimeRemaining(settings.defaultTimeLimit || 120);
      setIsTimerStopped(false);
      setTimeWarning(false);
      console.log(`[LoadEvent] Timer reset to ${settings.defaultTimeLimit || 120} seconds for new question`);
      
      setGameState("guessing");
      setIsLoading(false);
      
      // Save updated progress with optimized timing
      if (autoSaveEnabled) {
        // Use requestIdleCallback for better performance, fallback to shorter timeout
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => {
            console.log(`[LoadEvent] Auto-saving progress after loading round ${state.currentRound}`);
            saveGameProgress();
          }, { timeout: 1950 });
        } else {
          setTimeout(() => {
            console.log(`[LoadEvent] Auto-saving progress after loading round ${state.currentRound}`);
            saveGameProgress();
          }, 500);
        }
      }
      
      console.log(`[LoadEvent] Successfully completed loading round ${state.currentRound}`);
      
    } catch (error) {
      console.error(`[LoadEvent] Failed to load event for round ${state.currentRound} after retries:`, error);
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
          console.log(`Using existing event for round ${currentRound}: ${event.city} (${event.year})`);
          
          setCurrentEvent(event);
          setGuessLocation(null);
          setSelectedYear(1950);
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
          // Event not loaded, force on-demand loading
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
    <main className="h-screen bg-black text-white flex flex-col relative overflow-hidden">
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
        onSettingsChange={() => {
          // Reload settings
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
            {(() => {
              // console.log('Before GameImage render - currentEvent:', currentEvent);
              // console.log('Before GameImage render - imageUrl:', currentEvent.imageUrl);
              // console.log('Before GameImage render - description:', currentEvent.description);
              return (
                <GameImage 
                  imageUrl={currentEvent.imageUrl || currentEvent.image_url || ''} 
                  eventName={currentEvent.description || ''}
                />
              );
            })()}
          </div>

          {/* Mobile info panel */}
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

          {/* Desktop status panel */}
          <DesktopStatusPanel
            timeRemaining={timeRemaining}
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            guessLocation={guessLocation}
            currentYear={currentYear}
          />

          {/* Mobile bottom submit button */}
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-40 pointer-events-auto">
            {/* Time warning alert */}
            {timeWarning && (
              <div className="mb-2 p-3 bg-red-500 text-white rounded-lg text-center font-medium">
                ⏰ Time's up! Please submit your answer as soon as possible
              </div>
            )}
            {/* Submit error handling options */}
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
                    🔄 Retry Submit
                  </button>
                  <button
                    onClick={handleSkipQuestion}
                    className="flex-1 px-3 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600"
                  >
                    ⏭️ Skip Question
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

          {/* Combined container for map and desktop submit button */}
          <div className="absolute bottom-20 md:bottom-4 left-4 right-4 z-30 pointer-events-auto">
            {/* Desktop submit button - positioned above map */}
            <div className="hidden md:flex flex-col items-center z-50 pointer-events-auto relative -bottom-6">
              {/* Time warning alert */}
              {timeWarning && (
                <div className="mb-2 p-3 bg-red-500 text-white rounded-lg text-center font-medium">
                  ⏰ Time's up! Please submit your answer as soon as possible
                </div>
              )}
              {/* Submit error handling options */}
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
                      🔄 Retry Submit
                    </button>
                    <button
                      onClick={handleSkipQuestion}
                      className="flex-1 px-3 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600"
                    >
                      ⏭️ Skip Question
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
            
            {/* Map container */}
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
});

export default Game;
