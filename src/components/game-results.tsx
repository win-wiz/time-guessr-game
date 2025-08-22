"use client";

import { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GameMap } from "@/components/game-map";
import { MapPin, Navigation, ArrowRight, Calendar } from "lucide-react";

interface GameResultsProps {
  guessLocation: { lat: number; lng: number };
  actualLocation: { lat: number; lng: number };
  score: number;
  distance: number;
  onNextRound: () => void;
  isLastRound: boolean;
  guessedYear?: number;
  actualYear?: number;
}

export const GameResults = memo(function GameResults({
  guessLocation,
  actualLocation,
  score,
  distance,
  onNextRound,
  isLastRound,
  guessedYear,
  actualYear,
}: GameResultsProps) {
  // Memoize formatted distance to prevent unnecessary recalculations
  const formattedDistance = useMemo(() => distance.toFixed(2), [distance]);

  // Memoize year difference calculation
  const yearDifference = useMemo(() => {
    if (!guessedYear || !actualYear) return null;
    return Math.abs(guessedYear - actualYear);
  }, [guessedYear, actualYear]);

  // Memoize feedback message based on score
  const feedbackMessage = useMemo(() => {
    if (score > 4000) {
      return "Excellent! Your guess was very close to the actual location and time.";
    } else if (score > 2000) {
      return "Good job! Your guess was in the right area and time range.";
    } else {
      return "Keep trying! Next time, observe landmarks and era characteristics more carefully.";
    }
  }, [score]);

  // Memoize button text
  const buttonText = useMemo(() => {
    return isLastRound ? "View Final Results" : "Next Round";
  }, [isLastRound]);

  // Memoize whether to show year comparison
  const showYearComparison = useMemo(() => {
    return !!(guessedYear && actualYear);
  }, [guessedYear, actualYear]);

  // Optimize onNextRound callback
  const handleNextRound = useCallback(() => {
    onNextRound();
  }, [onNextRound]);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="dark:bg-gray-800 light:bg-white">
        <CardHeader>
          <CardTitle>Round Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold"></h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 light:text-gray-500">
                Score
              </p>
              <p className="text-2xl font-bold">{score} 分</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 light:text-gray-500">
                Distance
              </p>
              <p className="text-2xl font-bold">{formattedDistance} km</p>
            </div>
          </div>

          {/* Year comparison */}
          {showYearComparison && (
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Year Comparison</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your Guess
                  </p>
                  <p className="text-lg font-bold text-blue-600">{guessedYear}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Actual Year
                  </p>
                  <p className="text-lg font-bold text-green-600">{actualYear}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Year difference: {yearDifference} years
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-sm">Your Guess</span>
            </div>
            <div className="flex items-center">
              <Navigation className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-sm">Actual Location</span>
            </div>
          </div>

          <div className="rounded-md bg-gray-100 dark:bg-gray-700 light:bg-gray-100 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 light:text-gray-600">
              {feedbackMessage}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleNextRound}
            className="w-full bg-[#3bc054] hover:bg-[#2b873c] text-white"
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <div>
        <GameMap
          guessLocation={guessLocation}
          actualLocation={actualLocation}
          isGuessing={false}
        />
      </div>
    </div>
  );
});
