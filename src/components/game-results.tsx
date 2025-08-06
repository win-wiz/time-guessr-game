"use client";

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

export function GameResults({
  guessLocation,
  actualLocation,
  score,
  distance,
  onNextRound,
  isLastRound,
  guessedYear,
  actualYear,
}: GameResultsProps) {
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
                得分
              </p>
              <p className="text-2xl font-bold">{score} 分</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 light:text-gray-500">
                距离
              </p>
              <p className="text-2xl font-bold">{distance.toFixed(2)} km</p>
            </div>
          </div>

          {/* 年份对比 */}
          {guessedYear && actualYear && (
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">年份对比</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    你的猜测
                  </p>
                  <p className="text-lg font-bold text-blue-600">{guessedYear}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    实际年份
                  </p>
                  <p className="text-lg font-bold text-green-600">{actualYear}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                年份差异: {Math.abs(guessedYear - actualYear)} 年
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-sm">你的猜测</span>
            </div>
            <div className="flex items-center">
              <Navigation className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-sm">实际位置</span>
            </div>
          </div>

          <div className="rounded-md bg-gray-100 dark:bg-gray-700 light:bg-gray-100 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 light:text-gray-600">
              {score > 4000
                ? "太棒了！你的猜测非常接近实际位置和时间。"
                : score > 2000
                ? "不错！你的猜测在正确的区域和时间范围内。"
                : "继续努力！下次可以多观察地标建筑和时代特征。"}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={onNextRound}
            className="w-full bg-[#3bc054] hover:bg-[#2b873c] text-white"
          >
            {isLastRound ? "查看最终结果" : "下一轮"}
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
}
