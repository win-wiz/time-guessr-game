"use client";

import { useState, useEffect } from "react";
import { GameMap } from "@/components/game-map";
import { GameControls } from "@/components/game-controls";
import { GameProgress } from "@/components/game-progress";
import { GameResults } from "@/components/game-results";
import { GameImage } from "@/components/game-image";
import { calculateScore, calculateDistance } from "@/lib/game-utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import { fetchEventsFromAPI, TimeGuessrEvent, submitGuessToAPI, UserGuess, VerificationResult } from "@/lib/data-service";

export default function Game() {
  const router = useRouter();
  const [events, setEvents] = useState<TimeGuessrEvent[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds] = useState(5);
  const [currentEvent, setCurrentEvent] = useState<TimeGuessrEvent | null>(null);
  const [guessLocation, setGuessLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [gameState, setGameState] = useState<
    "guessing" | "results" | "summary"
  >("guessing");
  const [scores, setScores] = useState<
    Array<{
      score: number;
      distance: number;
      yearDifference: number;
      event: TimeGuessrEvent;
      guessedYear: number;
      actualLat: number;
      actualLng: number;
    }>
  >([]);
  const [timeRemaining, setTimeRemaining] = useState(60);

  useEffect(() => {
    // 获取事件数据
    fetchEventsFromAPI(5)
      .then(data => {
        console.log('Fetched events:', data);
        setEvents(data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        // 如果API调用失败，可以显示错误信息给用户
      });
  }, []);

  useEffect(() => {
    if (events.length > 0 && currentRound <= events.length) {
      const event = events[currentRound - 1];
      setCurrentEvent(event);
      setSelectedYear(2000); // 重置年份选择
    }
  }, [currentRound, events]);

  useEffect(() => {
    if (gameState === "guessing" && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "guessing" && timeRemaining === 0) {
      handleSubmitGuess();
    }
  }, [timeRemaining, gameState]);

  const handleMapClick = (lat: number, lng: number) => {
    if (gameState === "guessing") {
      setGuessLocation({ lat, lng });
    }
  };

  const handleSubmitGuess = async () => {
    if (!currentEvent) return;

    if (!guessLocation) {
      // User made no guess → 0 points
      setScores([
        ...scores,
        { 
          score: 0, 
          distance: 0, 
          yearDifference: Math.abs(selectedYear - currentEvent.year),
          event: currentEvent, 
          guessedYear: selectedYear,
          actualLat: currentEvent.latitude,
          actualLng: currentEvent.longitude
        },
      ]);
      setGameState("results");
      return;
    }

    try {
      // 提交猜测到后台进行验证
      const guess: UserGuess = {
        eventId: currentEvent.id,
        guessedLat: guessLocation.lat,
        guessedLng: guessLocation.lng,
        guessedYear: selectedYear
      };

      const result: VerificationResult = await submitGuessToAPI(guess);
      
      setScores([...scores, { 
        score: result.score, 
        distance: result.distance,
        yearDifference: result.yearDifference,
        event: currentEvent, 
        guessedYear: selectedYear,
        actualLat: result.actualLat,
        actualLng: result.actualLng
      }]);
    } catch (error) {
      console.error('Error submitting guess:', error);
      // 如果API调用失败，使用本地计算作为备选
      const distance = calculateDistance(
        guessLocation.lat,
        guessLocation.lng,
        currentEvent.latitude,
        currentEvent.longitude
      );
      const yearDifference = Math.abs(selectedYear - currentEvent.year);
      const yearBonus = Math.max(0, 100 - yearDifference * 5);
      const locationScore = calculateScore(distance);
      const totalScore = Math.round(locationScore + yearBonus);
      
      setScores([...scores, { 
        score: totalScore, 
        distance,
        yearDifference,
        event: currentEvent, 
        guessedYear: selectedYear,
        actualLat: currentEvent.latitude,
        actualLng: currentEvent.longitude
      }]);
    }

    setGameState("results");
  };

  const handleNextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setGuessLocation(null);
      setGameState("guessing");
    } else {
      setGameState("summary");
    }
  };

  const handlePlayAgain = () => {
    setCurrentRound(1);
    setScores([]);
    setGuessLocation(null);
    setSelectedYear(2000);
    setGameState("guessing");
    setTimeRemaining(60);
    // 重新获取事件数据
    fetchEventsFromAPI(5)
      .then(data => setEvents(data))
      .catch(error => console.error('Error fetching events:', error));
  };

  const totalScore = scores.reduce((sum, round) => sum + round.score, 0);

  return (
    <main className="min-h-screen bg-white text-black dark:bg-[#001233] dark:text-white">
      <Header />
      <div className="container mx-auto p-4">
        <div className="mb-4 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="ml-auto">
            <GameProgress
              currentRound={currentRound}
              totalRounds={totalRounds}
              scores={scores}
            />
          </div>
        </div>

        {gameState === "guessing" && currentEvent && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              {/* 展示历史事件图片 */}
              <GameImage imageUrl={currentEvent.image_url} />
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">历史线索</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>事件名称:</strong> {currentEvent.event_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>城市:</strong> {currentEvent.city}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>事件详情:</strong> {currentEvent.event_detail}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>描述:</strong> {currentEvent.event_description}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <GameMap
                onMapClick={handleMapClick}
                guessLocation={guessLocation}
                actualLocation={null}
                isGuessing={true}
              />
              <GameControls
              onSubmitGuess={handleSubmitGuess}
              hasGuess={!!guessLocation}
              timeRemaining={timeRemaining}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              minYear={1900}
              maxYear={2024}
            />
            </div>
          </div>
        )}

        {gameState === "results" &&
          currentEvent &&
          currentRound <= totalRounds && (
            <GameResults
              guessLocation={guessLocation || { lat: 0, lng: 0 }}
              actualLocation={{
                lat: scores[scores.length - 1]?.actualLat || currentEvent.latitude,
                lng: scores[scores.length - 1]?.actualLng || currentEvent.longitude
              }}
              score={scores[scores.length - 1]?.score || 0}
              distance={scores[scores.length - 1]?.distance || 0}
              onNextRound={handleNextRound}
              isLastRound={currentRound === totalRounds}
              guessedYear={scores[scores.length - 1]?.guessedYear}
              actualYear={currentEvent.year}
            />
          )}

        {gameState === "summary" && (
          <div className="rounded-lg bg-white dark:bg-gray-800 light:bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">游戏总结</h2>
            <div className="mb-6">
              <p className="text-xl">总分: {totalScore} 分</p>
            </div>

            <div className="mb-6 space-y-4">
              <h3 className="text-lg font-semibold">各轮结果:</h3>
              {scores.map((round, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">第 {index + 1} 轮</p>
                    <p className="font-bold text-lg">{round.score} 分</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <strong>事件:</strong> {round.event.city} - {round.event.event_name}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>距离:</strong> {round.distance.toFixed(2)} km
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>年份:</strong> 猜测 {round.guessedYear} / 实际 {round.event.year}
                        {round.guessedYear && (
                          <span className={`ml-2 text-xs ${
                            round.yearDifference <= 5 
                              ? 'text-green-600 dark:text-green-400' 
                              : round.yearDifference <= 15
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            (差异 {round.yearDifference} 年)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handlePlayAgain}
                className="bg-blue-800 hover:bg-blue-900 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                再玩一次
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
