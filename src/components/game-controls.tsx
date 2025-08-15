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
  const isTimeRunningOut = timeRemaining <= 10;

  return (
    <Card className="dark:bg-gray-800 light:bg-white shadow-lg border-2 border-gray-200 dark:border-gray-600">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* 时间显示区域 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className={`mr-2 h-5 w-5 ${isTimeRunningOut ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
                <span className="text-sm font-semibold">剩余时间</span>
              </div>
              <span className={`text-lg font-bold ${isTimeRunningOut ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                {timeRemaining}秒
              </span>
            </div>
            <Progress 
              value={timePercentage} 
              className={`h-3 ${isTimeRunningOut ? 'animate-pulse' : ''}`}
            />
          </div>

          {/* 年份选择器 */}
          <div className="space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg border border-blue-200 dark:border-gray-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">选择年份</span>
              </div>
              <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-1 rounded-full">
                <span className="text-lg font-bold">{selectedYear}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Slider
                value={[selectedYear]}
                onValueChange={(value) => onYearChange?.(value[0])}
                min={minYear}
                max={maxYear}
                step={1}
                className="w-full"
              />
              
              {/* 年份范围和快速选择 */}
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">{minYear}</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onYearChange?.(1950)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    1950
                  </button>
                  <button 
                    onClick={() => onYearChange?.(1980)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    1980
                  </button>
                  <button 
                    onClick={() => onYearChange?.(2000)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    2000
                  </button>
                </div>
                <span className="font-medium">{maxYear}</span>
              </div>
            </div>
          </div>

          {/* 状态提示区域 */}
          <div className={`rounded-lg p-4 border-l-4 ${
            hasGuess 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400' 
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-400'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                hasGuess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-amber-500 text-white'
              }`}>
                {hasGuess ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className={`text-sm font-medium ${
                hasGuess 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-amber-800 dark:text-amber-200'
              }`}>
                {hasGuess
                  ? "✓ 已选择位置和年份！准备好后提交猜测。"
                  : "请在地图上点击选择位置，并调整年份滑块。"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          onClick={onSubmitGuess}
          disabled={!hasGuess}
          className={`w-full h-12 text-lg font-semibold transition-all duration-200 ${
            hasGuess 
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
              : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
          }`}
        >
          <MapPin className="mr-2 h-5 w-5" />
          {hasGuess ? '提交猜测' : '请先选择位置'}
        </Button>
      </CardFooter>
    </Card>
  );
}
