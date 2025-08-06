"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { MapPin, Clock, Calendar } from "lucide-react";

interface GameControlsProps {
  onSubmitGuess: () => void;
  hasGuess: boolean;
  timeRemaining: number;
  selectedYear?: number;
  onYearChange?: (year: number) => void;
  minYear?: number;
  maxYear?: number;
}

export function GameControls({
  onSubmitGuess,
  hasGuess,
  timeRemaining,
  selectedYear = 2000,
  onYearChange,
  minYear = 1900,
  maxYear = 2024,
}: GameControlsProps) {
  const timePercentage = (timeRemaining / 60) * 100;

  return (
    <Card className="dark:bg-gray-800 light:bg-white">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 light:text-gray-500" />
                <span className="text-sm font-medium">Time Remaining</span>
              </div>
              <span className="text-sm font-medium">{timeRemaining}s</span>
            </div>
            <Progress value={timePercentage} className="h-2" />
          </div>

          {/* 时间选择器 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium">选择年份</span>
              </div>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedYear}</span>
            </div>
            <div className="px-2">
              <Slider
                value={[selectedYear]}
                onValueChange={(value) => onYearChange?.(value[0])}
                min={minYear}
                max={maxYear}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{minYear}</span>
                <span>{maxYear}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-gray-100 dark:bg-gray-700 light:bg-gray-100 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 light:text-gray-600">
              {hasGuess
                ? "已选择位置和年份！准备好后提交猜测。"
                : "在地图上点击选择位置，并调整年份滑块。"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSubmitGuess}
          disabled={!hasGuess}
          className="w-full bg-[#3bc054] hover:bg-[#2b873c] disabled:bg-gray-300"
        >
          <MapPin className="mr-2 h-4 w-4" />
          提交猜测
        </Button>
      </CardFooter>
    </Card>
  );
}
