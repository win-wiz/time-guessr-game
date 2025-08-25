"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

// Rating level judgment functions - moved outside component for better performance
const getTimeRank = (yearDiff: number): { rank: string; color: string } => {
  if (yearDiff === 0) return { rank: "Perfect", color: "text-yellow-400" };
  if (yearDiff <= 1) return { rank: "Excellent", color: "text-green-400" };
  if (yearDiff <= 3) return { rank: "Very Good", color: "text-blue-400" };
  if (yearDiff <= 5) return { rank: "Good", color: "text-purple-400" };
  if (yearDiff <= 10) return { rank: "Average", color: "text-orange-400" };
  if (yearDiff <= 20) return { rank: "Poor", color: "text-red-400" };
  return { rank: "Very Poor", color: "text-gray-400" };
};

const getLocationRank = (distance: number): { rank: string; color: string } => {
  if (distance <= 0.1) return { rank: "Perfect", color: "text-yellow-400" };
  if (distance <= 1) return { rank: "Excellent", color: "text-green-400" };
  if (distance <= 5) return { rank: "Very Good", color: "text-blue-400" };
  if (distance <= 25) return { rank: "Good", color: "text-purple-400" };
  if (distance <= 100) return { rank: "Average", color: "text-orange-400" };
  if (distance <= 500) return { rank: "Poor", color: "text-red-400" };
  return { rank: "Very Poor", color: "text-gray-400" };
};

const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

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

  // Memoized calculations for better performance
  const timeRank = useMemo(() => getTimeRank(yearDifference), [yearDifference]);
  const locationRank = useMemo(() => getLocationRank(distance), [distance]);

  // Score animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(finalScore);
      setShowDetails(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [finalScore]);

  // Optimized event handlers with useCallback
  const handleNextRound = useCallback(() => {
    router.push('/game');
  }, [router]);

  const handleViewSummary = useCallback(() => {
    router.push('/game/summary');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header information */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Round {currentRound} Results
          </h1>
          <p className="text-gray-300">{currentEvent.event_name}</p>
        </div>

        {/* Main score card */}
        <Card className="bg-black/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Total score display */}
              <div className="space-y-2">
                <div className="text-6xl font-bold text-white">
                  {animatedScore.toLocaleString()}
                </div>
                <div className="text-xl text-gray-300">Total Score</div>
                {streak > 1 && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                    <Zap className="w-4 h-4 mr-1" />
                    {streak} Streak
                  </Badge>
                )}
              </div>

              {/* Achievement display */}
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

        {/* Detailed score breakdown */}
        {showDetails && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Time dimension */}
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
                      <span className="text-white">{guessedYear}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Actual Year</span>
                      <span className="text-white">{actualYear}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Difference</span>
                      <span className="text-white">{yearDifference} years</span>
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

            {/* Geographic dimension */}
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

        {/* Bonus score */}
        {showDetails && bonusScore > 0 && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Bonus Score</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">+{bonusScore}</span>
              </div>
              <div className="mt-2 text-sm text-gray-300">
                Includes speed bonus, streak bonus, and accuracy bonus
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answer time */}
        {showDetails && (
          <Card className="bg-black/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Answer Time</span>
                </div>
                <span className="text-white">{answerTime}s</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {currentRound < totalRounds ? (
            <Button 
              onClick={handleNextRound}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Next Question
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleViewSummary}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              View Summary
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}