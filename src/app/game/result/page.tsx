"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/game/loading-state";
import { GameAPIService } from "@/lib/api-service";
import { QuestionResultDetail } from "@/components/game/question-result-detail";
import { GameRoundManager } from "@/lib/game-round-manager";

// 类型定义
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

export default function GameResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [currentQuestionResult, setCurrentQuestionResult] = useState<QuestionResult | null>(null);
  const [selectedQuestionResult, setSelectedQuestionResult] = useState<QuestionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取游戏结果 - 使用统一API服务
  const fetchGameResult = async (gameSessionId: string): Promise<void> => {
    try {
      const result = await GameAPIService.getGameResult(gameSessionId);
      setGameResult(result);
    } catch (error) {
      console.error('Error fetching game result:', error);
      setError(error instanceof Error ? error.message : '获取游戏结果失败');
    }
  };

  // 获取单题详细结果 - 使用统一API服务
  const fetchQuestionResult = async (questionSessionId: string): Promise<QuestionResult | null> => {
    try {
      const result = await GameAPIService.getQuestionResult(questionSessionId);
      return result;
    } catch (error) {
      console.error('Error fetching question result:', error);
      return null;
    }
  };

  useEffect(() => {
    const gameSessionId = searchParams.get('gameSessionId');
    const questionSessionId = searchParams.get('questionSessionId');
    const status = searchParams.get('status');

    if (!gameSessionId) {
      router.push('/game');
      return;
    }

    const loadResults = async () => {
      setLoading(true);
      
      try {
        // 只有当游戏完成时才获取游戏总结
        if (status === 'completed') {
          fetchGameResult(gameSessionId).catch(error => {
            console.error('Error fetching game result:', error);
            // 即使游戏结果获取失败，也继续加载问题结果
          });
        }
        
        // 立即获取问题结果
        if (questionSessionId) {
          try {
            const questionResult = await fetchQuestionResult(questionSessionId);
            if (questionResult) {
              setCurrentQuestionResult(questionResult);
              setSelectedQuestionResult(questionResult);
            }
          } catch (questionError) {
            console.error('Error fetching question result:', questionError);
            setError('获取题目结果失败');
          }
        }
      } catch (error) {
        console.error('Error loading results:', error);
        setError('加载结果失败');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [searchParams, router]);

  // 处理选择其他题目
  const handleSelectQuestion = async (questionSessionId: string) => {
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
  };

  // 处理重新开始游戏
  const handlePlayAgain = () => {
    router.push('/game');
  };

  // 处理继续游戏 - 改进currentRound同步
  const handleContinueGame = async () => {
    const gameSessionId = searchParams.get('gameSessionId');
    const status = searchParams.get('status');
    const currentRoundParam = searchParams.get('currentRound');
    const totalRoundsParam = searchParams.get('totalRounds');
    
    // 如果游戏未完成，返回游戏页面继续
    if (status === 'submitted' && gameSessionId) {
      // 尝试从questionResult获取准确的questionNumber
      let nextRound = currentRoundParam ? parseInt(currentRoundParam) + 1 : 2;
      
      // 如果有questionResult，使用其questionNumber来确定下一轮
      if (currentQuestionResult && currentQuestionResult.questionNumber) {
        nextRound = currentQuestionResult.questionNumber + 1;
        console.log(`Using questionResult.questionNumber: ${currentQuestionResult.questionNumber}, nextRound: ${nextRound}`);
      } else {
        console.log(`Using currentRoundParam: ${currentRoundParam}, nextRound: ${nextRound}`);
      }
      
      // 检查是否还有下一题
      const totalRounds = totalRoundsParam ? parseInt(totalRoundsParam) : 5;
      if (nextRound > totalRounds) {
        // 所有题目已完成，开始新游戏
        console.log('All questions completed, starting new game');
        router.push('/game');
        return;
      }
      
      console.log(`=== CONTINUE GAME ===`);
      console.log(`GameSessionId: ${gameSessionId}`);
      console.log(`Current round: ${currentRoundParam} -> Next round: ${nextRound}`);
      console.log(`Total rounds: ${totalRounds}`);
      
      // 使用轮次管理器保存恢复信息
      GameRoundManager.saveResumeInfo({
        gameSessionId,
        nextRound,
        totalRounds,
        timestamp: Date.now()
      });
      
      // 清除当前页面的缓存，确保游戏页面重新加载
      if (typeof window !== 'undefined') {
        // 强制刷新游戏页面的状态
        sessionStorage.setItem('force_reload_game', 'true');
      }
      
      // 返回游戏页面，传递轮次信息
      const gameUrl = `/game?resume=true&gameSessionId=${gameSessionId}&round=${nextRound}&totalRounds=${totalRounds}&timestamp=${Date.now()}`;
      console.log(`Navigating to: ${gameUrl}`);
      router.push(gameUrl);
    } else {
      // 否则开始新游戏
      console.log('Starting new game');
      router.push('/game');
    }
  };

  // 处理分享结果
  const handleShare = () => {
    if (gameResult) {
      const shareText = `我在 Time Guessr 中获得了 ${gameResult.totalScore} 分！平均分：${gameResult.averageScore}`;
      if (navigator.share) {
        navigator.share({
          title: 'Time Guessr 游戏结果',
          text: shareText,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        alert('结果已复制到剪贴板！');
      }
    } else if (selectedQuestionResult) {
      const shareText = `我在 Time Guessr 中获得了 ${selectedQuestionResult.scoringDetails.finalScore} 分！等级：${selectedQuestionResult.scoringDetails.rank}`;
      if (navigator.share) {
        navigator.share({
          title: 'Time Guessr 题目结果',
          text: shareText,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        alert('结果已复制到剪贴板！');
      }
    }
  };

  if (loading && !selectedQuestionResult) {
    return <LoadingState message="正在加载结果数据..." />;
  }

  // 如果既没有游戏结果也没有问题结果，显示错误
  if (error && !selectedQuestionResult && !gameResult) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">加载失败</h1>
          <p className="mb-4">{error || '无法获取结果'}</p>
          <button
            onClick={() => router.push('/game')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            返回游戏
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 游戏总体结果 - 只在游戏完成时显示 */}
        {gameResult && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">游戏结果</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{gameResult.totalScore}</div>
                <div className="text-sm text-gray-300">总分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{gameResult.averageScore}</div>
                <div className="text-sm text-gray-300">平均分</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{gameResult.questionsCompleted}/{gameResult.totalQuestions}</div>
                <div className="text-sm text-gray-300">完成度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{gameResult.gameMode === 'timed' ? '计时' : '不计时'}</div>
                <div className="text-sm text-gray-300">模式</div>
              </div>
            </div>
          </div>
        )}

        {/* 当前题目详细结果 - 使用新的详细组件 */}
        {selectedQuestionResult && (
          <QuestionResultDetail 
            questionResult={selectedQuestionResult} 
            onNextQuestion={handleContinueGame}
            hasNextQuestion={(() => {
              const currentRoundParam = searchParams.get('currentRound');
              const totalRoundsParam = searchParams.get('totalRounds');
              const status = searchParams.get('status');
              
              // 如果游戏已完成，则没有下一题
              if (status === 'completed') {
                return false;
              }
              
              // 计算下一轮数
              let nextRound = currentRoundParam ? parseInt(currentRoundParam) + 1 : 2;
              if (selectedQuestionResult && selectedQuestionResult.questionNumber) {
                nextRound = selectedQuestionResult.questionNumber + 1;
              }
              
              const totalRounds = totalRoundsParam ? parseInt(totalRoundsParam) : 5;
              return nextRound <= totalRounds;
            })()}
          />
        )}

        {/* 所有题目汇总 - 只在游戏结果加载完成后显示 */}
        {gameResult && gameResult.questionSessions.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-28 mt-10">
            <h2 className="text-2xl font-bold text-white mb-6">所有题目汇总</h2>
            
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
                    <div className="text-white font-semibold mb-2">题目 {index + 1}</div>
                    <div className="text-sm text-gray-300 mb-1">分数: {question.finalScore}</div>
                    <div className="text-sm text-gray-300 mb-1">等级: {question.rank}</div>
                    {question.answerTime && (
                      <div className="text-sm text-gray-300">时间: {question.answerTime}秒</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {searchParams.get('status') === 'submitted' ? (
            <>
              <button
                onClick={handleContinueGame}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                继续游戏
              </button>
              <button
                onClick={handlePlayAgain}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                重新开始
              </button>
            </>
          ) : (
            <button
              onClick={handlePlayAgain}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              再玩一次
            </button>
          )}
          <button
            onClick={handleShare}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            分享结果
          </button>
        </div> */}
      </div>
    </main>
  );
}