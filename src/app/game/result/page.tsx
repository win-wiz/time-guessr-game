"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback, Suspense, memo, useRef } from "react";
import { LoadingState } from "@/components/game/loading-state";
import { GameAPIService } from "@/lib/api-service";
import { QuestionResultDetail } from "@/components/game/question-result-detail";
import { GameRoundManager } from "@/lib/game-round-manager";

// Type definitions
interface GameResult {
  gameSessionId: string;
  totalScore: number;
  averageScore: number;
  questionsCompleted: number;
  totalQuestions: number;
  gameMode: string;
  timeLimit?: number;
  isCompleted: boolean;
  completedAt?: string;
  questionSessions: Array<{
    questionSessionId: string;
    eventId: string;
    guessedYear: number;
    guessedLocation?: {
      lat: number;
      lng: number;
    };
    answerTime?: number;
    finalScore: number;
    rank: string;
  }>;
}

interface QuestionResult {
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
}

// Internal component that handles useSearchParams
const GameResultContent = memo(function GameResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [currentQuestionResult, setCurrentQuestionResult] = useState<QuestionResult | null>(null);
  const [selectedQuestionResult, setSelectedQuestionResult] = useState<QuestionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store stable references
  const loadingRef = useRef(false);

  // Cache URL parameters to avoid repeated parsing
  const urlParams = useMemo(() => ({
    gameSessionId: searchParams.get('gameSessionId'),
    questionSessionId: searchParams.get('questionSessionId'),
    status: searchParams.get('status'),
    currentRound: searchParams.get('currentRound'),
    totalRounds: searchParams.get('totalRounds')
  }), [searchParams]);

  // Fetch game result - using unified API service
  const fetchGameResult = useCallback(async (gameSessionId: string): Promise<void> => {
    try {
      const result = await GameAPIService.getGameResult(gameSessionId);
      setGameResult(result);
    } catch (error) {
      console.error('Error fetching game result:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch game result');
    }
  }, []);

  // Fetch single question detailed result - using unified API service
  const fetchQuestionResult = useCallback(async (questionSessionId: string): Promise<QuestionResult | null> => {
    try {
      const result = await GameAPIService.getQuestionResult(questionSessionId);
      return result;
    } catch (error) {
      console.error('Error fetching question result:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const { gameSessionId, questionSessionId, status } = urlParams;

    if (!gameSessionId) {
      router.push('/game');
      return;
    }

    // Prevent duplicate loading
    if (loadingRef.current) {
      return;
    }

    const loadResults = async () => {
      loadingRef.current = true;
      setLoading(true);
      
      try {
        // Only fetch game summary when game is completed
        if (status === 'completed') {
          fetchGameResult(gameSessionId).catch(error => {
            console.error('Error fetching game result:', error);
            // Continue loading question results even if game result fails
          });
        }
        
        // Immediately fetch question result
        if (questionSessionId) {
          try {
            const questionResult = await fetchQuestionResult(questionSessionId);
            if (questionResult) {
              console.log('返回的结果=======>>>>>:', questionResult);
              setCurrentQuestionResult(questionResult);
              setSelectedQuestionResult(questionResult);
            }
          } catch (questionError) {
            console.error('Error fetching question result:', questionError);
            setError('Failed to fetch question result');
          }
        }
      } catch (error) {
        console.error('Error loading results:', error);
        setError('Failed to load results');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadResults();
  }, [urlParams.gameSessionId, urlParams.questionSessionId, urlParams.status, router, fetchGameResult, fetchQuestionResult]);

  // Handle selecting other questions
  const handleSelectQuestion = useCallback(async (questionSessionId: string) => {
    // Avoid duplicate requests
    if (selectedQuestionResult?.questionSessionId === questionSessionId) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await fetchQuestionResult(questionSessionId);
      if (result) {
        setSelectedQuestionResult(result);
      }
    } catch (error) {
      console.error('Error selecting question:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchQuestionResult, selectedQuestionResult?.questionSessionId]);

  // Handle continue game - improved currentRound synchronization
  const handleContinueGame = useCallback(async () => {
    const { gameSessionId, status, currentRound, totalRounds } = urlParams;
    
    // If game is not completed, return to game page to continue
    if (status === 'submitted' && gameSessionId) {
      // Try to get accurate questionNumber from questionResult
      let nextRound = currentRound ? parseInt(currentRound) + 1 : 2;
      
      // If questionResult exists, use its questionNumber to determine next round
      if (currentQuestionResult && currentQuestionResult.questionNumber) {
        nextRound = currentQuestionResult.questionNumber + 1;
        console.log(`Using questionResult.questionNumber: ${currentQuestionResult.questionNumber}, nextRound: ${nextRound}`);
      } else {
        console.log(`Using currentRoundParam: ${currentRound}, nextRound: ${nextRound}`);
      }
      
      // Check if there's a next question
      const totalRoundsNum = totalRounds ? parseInt(totalRounds) : 5;
      if (nextRound > totalRoundsNum) {
        // All questions completed, start new game
        console.log('All questions completed, starting new game');
        router.push('/game');
        return;
      }
      
      console.log(`=== CONTINUE GAME ===`);
      console.log(`GameSessionId: ${gameSessionId}`);
      console.log(`Current round: ${currentRound} -> Next round: ${nextRound}`);
      console.log(`Total rounds: ${totalRoundsNum}`);
      
      // Use round manager to save resume info
      GameRoundManager.saveResumeInfo({
        gameSessionId,
        nextRound,
        totalRounds: totalRoundsNum,
        timestamp: Date.now()
      });
      
      // Clear current page cache to ensure game page reloads
      if (typeof window !== 'undefined') {
        // Force refresh game page state
        sessionStorage.setItem('force_reload_game', 'true');
      }
      
      // Return to game page with round info
      const gameUrl = `/game?resume=true&gameSessionId=${gameSessionId}&round=${nextRound}&totalRounds=${totalRoundsNum}&timestamp=${Date.now()}`;
      console.log(`Navigating to: ${gameUrl}`);
      router.push(gameUrl);
    } else {
      // Otherwise start new game
      console.log('Starting new game');
      router.push('/game');
    }
  }, [urlParams, currentQuestionResult, router]);

  // Calculate if there's a next question - use useMemo to cache calculation result
  const hasNextQuestion = useMemo(() => {
    const { currentRound, totalRounds, status } = urlParams;
    
    // If game is completed, there's no next question
    if (status === 'completed') {
      return false;
    }
    
    // Calculate next round number
    let nextRound = currentRound ? parseInt(currentRound) + 1 : 2;
    if (selectedQuestionResult && selectedQuestionResult.questionNumber) {
      nextRound = selectedQuestionResult.questionNumber + 1;
    }
    
    const totalRoundsNum = totalRounds ? parseInt(totalRounds) : 5;
    return nextRound <= totalRoundsNum;
  }, [urlParams.status, urlParams.currentRound, urlParams.totalRounds, selectedQuestionResult?.questionNumber]);

  if (loading && !selectedQuestionResult) {
    return <LoadingState message="Loading result data..." />;
  }

  // If there's neither game result nor question result, show error
  if (error && !selectedQuestionResult && !gameResult) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Loading Failed</h1>
          <p className="mb-4">{error || 'Unable to get results'}</p>
          <button
            onClick={() => router.push('/game')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Back to Game
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Game overall result - only show when game is completed */}
        {gameResult && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Game Results</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{gameResult.totalScore}</div>
                <div className="text-sm text-gray-300">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{gameResult.averageScore}</div>
                <div className="text-sm text-gray-300">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{gameResult.questionsCompleted}/{gameResult.totalQuestions}</div>
                <div className="text-sm text-gray-300">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{gameResult.gameMode === 'timed' ? 'Timed' : 'Untimed'}</div>
                <div className="text-sm text-gray-300">Mode</div>
              </div>
            </div>
          </div>
        )}

        {/* Current question detailed result - using new detailed component */}
        {selectedQuestionResult && (
          <QuestionResultDetail 
            questionResult={selectedQuestionResult} 
            onNextQuestion={handleContinueGame}
            hasNextQuestion={hasNextQuestion}
          />
        )}

        {/* All questions summary - only show after game result is loaded */}
        {gameResult && gameResult.questionSessions.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-28">
            <h2 className="text-2xl font-bold text-white mb-6">All Questions Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameResult.questionSessions.map((question, index) => (
                <button
                  key={question.questionSessionId}
                  onClick={() => handleSelectQuestion(question.questionSessionId)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedQuestionResult?.questionSessionId === question.questionSessionId
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-white font-semibold mb-2">Question {index + 1}</div>
                    <div className="text-sm text-gray-300 mb-1">Score: {question.finalScore}</div>
                    <div className="text-sm text-gray-300 mb-1">Rank: {question.rank}</div>
                    {question.answerTime && (
                      <div className="text-sm text-gray-300">Time: {question.answerTime}s</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
});

// Main component wrapped with Suspense
export default function GameResultPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading page..." />}>
      <GameResultContent />
    </Suspense>
  );
}