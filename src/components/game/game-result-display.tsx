"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Clock, 
  Target, 
  Award,
  ChevronRight,
  Star,
  Zap,
  TrendingUp
} from "lucide-react";
import { TimeGuessrEvent } from "@/lib/data-service";

interface GameResultDisplayProps {
  currentEvent: TimeGuessrEvent;
  currentRound: number;
  totalRounds: number;
  guessedYear: number;
  guessedLat: number;
  guessedLng: number;
  actualYear: number;
  actualLat: number;
  actualLng: number;
  distance: number;
  yearDifference: number;
  timeScore: number;
  locationScore: number;
  bonusScore: number;
  finalScore: number;
  answerTime: number;
  streak?: number;
  achievements?: string[];
}

// 评分等级判断函数
function getTimeRank(yearDiff: number): { rank: string; color: string } {
  if (yearDiff === 0) return { rank: "完美", color: "text-yellow-400" };
  if (yearDiff <= 1) return { rank: "优秀", color: "text-green-400" };
  if (yearDiff <= 3) return { rank: "很好", color: "text-blue-400" };
  if (yearDiff <= 5) return { rank: "良好", color: "text-purple-400" };
  if (yearDiff <= 10) return { rank: "一般", color: "text-orange-400" };
  if (yearDiff <= 20) return { rank: "较差", color: "text-red-400" };
  return { rank: "很差", color: "text-gray-400" };
}

function getLocationRank(distance: number): { rank: string; color: string } {
  if (distance <= 0.1) return { rank: "完美", color: "text-yellow-400" };
  if (distance <= 1) return { rank: "优秀", color: "text-green-400" };
  if (distance <= 5) return { rank: "很好", color: "text-blue-400" };
  if (distance <= 25) return { rank: "良好", color: "text-purple-400" };
  if (distance <= 100) return { rank: "一般", color: "text-orange-400" };
  if (distance <= 500) return { rank: "较差", color: "text-red-400" };
  return { rank: "很差", color: "text-gray-400" };
}

function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}米`;
  }
  return `${distance.toFixed(1)}公里`;
}

export function GameResultDisplay({
  currentEvent,
  currentRound,
  totalRounds,
  guessedYear,
  actualYear,
  distance,
  yearDifference,
  timeScore,
  locationScore,
  bonusScore,
  finalScore,
  answerTime,
  streak = 0,
  achievements = []
}: GameResultDisplayProps) {
  const router = useRouter();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const timeRank = getTimeRank(yearDifference);
  const locationRank = getLocationRank(distance);

  // 分数动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(finalScore);
      setShowDetails(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [finalScore]);

  const handleNextRound = () => {
    router.push('/game');
  };

  const handleViewSummary = () => {
    router.push('/game/summary');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* 头部信息 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            第 {currentRound} 轮结果
          </h1>
          <p className="text-gray-300">{currentEvent.event_name}</p>
        </div>

        {/* 主要得分卡片 */}
        <Card className="bg-black/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* 总分显示 */}
              <div className="space-y-2">
                <div className="text-6xl font-bold text-white">
                  {animatedScore.toLocaleString()}
                </div>
                <div className="text-xl text-gray-300">Total Score</div>
                {streak > 1 && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                    <Zap className="w-4 h-4 mr-1" />
                    {streak} 连击
                  </Badge>
                )}
              </div>

              {/* 成就展示 */}
              {achievements.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {achievements.map((achievement, index) => (
                    <Badge key={index} variant="outline" className="border-yellow-400 text-yellow-400">
                      <Award className="w-3 h-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 详细分数分解 */}
        {showDetails && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* 时间维度 */}
            <Card className="bg-black/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white">Time Guess</span>
                    </div>
                    <Badge className={`${timeRank.color} bg-transparent border-current`}>
                      {timeRank.rank}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Your Guess</span>
                      <span className="text-white">{guessedYear}年</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Actual Year</span>
                      <span className="text-white">{actualYear}年</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">差距</span>
                      <span className="text-white">{yearDifference}年</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score</span>
                      <span className="text-white font-bold">{timeScore}</span>
                    </div>
                    <Progress value={(timeScore / 1000) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 地理维度 */}
            <Card className="bg-black/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-white">Location Guess</span>
                    </div>
                    <Badge className={`${locationRank.color} bg-transparent border-current`}>
                      {locationRank.rank}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Distance Error</span>
                      <span className="text-white">{formatDistance(distance)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score</span>
                      <span className="text-white font-bold">{locationScore}</span>
                    </div>
                    <Progress value={(locationScore / 1000) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 奖励分数 */}
        {showDetails && bonusScore > 0 && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">奖励分数</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">+{bonusScore}</span>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                包含速度奖励、连击奖励等
              </div>
            </CardContent>
          </Card>
        )}

        {/* 答题时间 */}
        {showDetails && (
          <Card className="bg-black/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">答题用时</span>
                </div>
                <span className="text-white">{answerTime}秒</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentRound < totalRounds ? (
            <Button 
              onClick={handleNextRound}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              下一题
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleViewSummary}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              查看总结
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}