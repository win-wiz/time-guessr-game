"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Clock, Calendar, Award, Target, Navigation } from "lucide-react";
import { GameMap } from "@/components/game-map";

// 计算两点之间的距离（单位：公里）
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

interface QuestionResultDetailProps {
  questionResult: {
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
    // 正确的事件详情字段名
    event?: {
      id: string;
      city: string;
      latitude: number;
      longitude: number;
      year: number;
      description?: string;
      imageUrl?: string;
      difficulty?: string;
    };
    // 兼容旧版本的字段名
    eventDetails?: {
      description: string;
      imageUrl: string;
      eventName?: string;
      eventDetail?: string;
      city?: string;
      country?: string;
      year?: number;
    };
    eventDetail?: {
      id: string;
      city: string;
      latitude: number;
      longitude: number;
      year: number;
      description?: string;
      imageUrl?: string;
      difficulty?: string;
    };
  };
  onClose?: () => void;
}

export const QuestionResultDetail = ({ questionResult, onClose }: QuestionResultDetailProps) => {
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(0);

  // 初始化事件详情和计算距离
  useEffect(() => {
    // 计算距离
    if (questionResult.actualLocation && questionResult.guessedLocation) {
      const dist = calculateDistance(
        questionResult.guessedLocation.lat,
        questionResult.guessedLocation.lng,
        questionResult.actualLocation.lat,
        questionResult.actualLocation.lng
      );
      setDistance(dist);
    }

    // 使用问题结果中包含的事件详情
    if (questionResult.event) {
      // 优先使用 event 字段
      setEventDetails(questionResult.event);
      setLoading(false);
    } else if (questionResult.eventDetails) {
      // 兼容旧版本的 eventDetails 字段
      setEventDetails(questionResult.eventDetails);
      setLoading(false);
    } else if (questionResult.eventDetail) {
      // 兼容旧版本的 eventDetail 字段
      setEventDetails(questionResult.eventDetail);
      setLoading(false);
    } else {
      setError('无法加载事件详情');
      setLoading(false);
    }
  }, [questionResult]);

  // 获取等级对应的颜色
  const getRankColor = (rank: string) => {
    switch (rank.toUpperCase()) {
      case 'S': return 'text-yellow-400';
      case 'A': return 'text-green-400';
      case 'B': return 'text-blue-400';
      case 'C': return 'text-purple-400';
      case 'D': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  // 获取成就图标
  const getAchievementIcon = (achievement: string) => {
    if (achievement.includes('速度') || achievement.includes('快速')) return '⚡';
    if (achievement.includes('完美') || achievement.includes('精确')) return '🎯';
    if (achievement.includes('连续') || achievement.includes('streak')) return '🔥';
    if (achievement.includes('探索') || achievement.includes('发现')) return '🔍';
    return '🏆';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6">
        {/* 标题区域 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">题目 {questionResult.questionNumber} 详细结果</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">得分:</span>
            <span className="text-2xl font-bold text-blue-400">{questionResult.scoringDetails.finalScore}</span>
          </div>
        </div>

        {/* 图片和事件详情 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 图片区域 */}
          <div className="relative rounded-xl overflow-hidden h-64 lg:h-80">
            {eventDetails?.imageUrl ? (
              <Image 
                src={eventDetails.imageUrl} 
                alt={eventDetails.description || "历史事件图片"} 
                fill
                style={{ objectFit: 'cover' }}
                className="transition-transform hover:scale-105 duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p className="text-gray-400">图片加载中...</p>
              </div>
            )}
          </div>

          {/* 事件详情 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex flex-col">
            <h3 className="text-xl font-semibold mb-3">事件详情</h3>
            
            <div className="space-y-4 flex-1">
              {eventDetails ? (
                <>
                  <p className="text-gray-200">{eventDetails.description || eventDetails.eventDetail || "无详细描述"}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-300">实际年份: </span>
                      <span className="font-semibold">{questionResult.actualYear}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-400" />
                      <span className="text-gray-300">地点: </span>
                      <span className="font-semibold">{eventDetails.city || "未知"}</span>
                    </div>
                  </div>
                </>
              ) : loading ? (
                <p className="text-gray-400">加载事件详情中...</p>
              ) : error ? (
                <p className="text-red-400">{error}</p>
              ) : (
                <p className="text-gray-400">无事件详情</p>
              )}
            </div>
          </div>
        </div>

        {/* 猜测结果和评分详情 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 猜测结果 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <h3 className="text-xl font-semibold mb-4">猜测结果</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">猜测年份:</span>
                </div>
                <span className="font-semibold">{questionResult.guessedYear}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">实际年份:</span>
                </div>
                <span className="font-semibold">{questionResult.actualYear}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">年份差:</span>
                </div>
                <span className="font-semibold">{Math.abs(questionResult.guessedYear - questionResult.actualYear)} 年</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">答题时间:</span>
                </div>
                <span className="font-semibold">{questionResult.answerTime} 秒</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-red-400" />
                  <span className="text-gray-300">位置距离:</span>
                </div>
                <span className="font-semibold">{distance.toFixed(2)} 公里</span>
              </div>
            </div>
          </div>

          {/* 评分详情 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <h3 className="text-xl font-semibold mb-4">评分详情</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">时间分:</span>
                <span className="font-semibold">{questionResult.scoringDetails.timeScore}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">位置分:</span>
                <span className="font-semibold">{questionResult.scoringDetails.locationScore}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">奖励分:</span>
                <span className="font-semibold">{questionResult.scoringDetails.bonusScore}</span>
              </div>
              
              <div className="flex justify-between items-center border-t border-white/20 pt-2 mt-2">
                <span className="text-gray-300">总分:</span>
                <span className="text-xl font-bold text-blue-400">{questionResult.scoringDetails.finalScore}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">等级:</span>
                <span className={`text-xl font-bold ${getRankColor(questionResult.scoringDetails.rank)}`}>
                  {questionResult.scoringDetails.rank}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 地图区域 - 使用现有的 GameMap 组件 */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">位置对比</h3>
          
          <div className="h-[400px] rounded-xl overflow-hidden border border-white/10">
            <GameMap
              guessLocation={questionResult.guessedLocation}
              actualLocation={questionResult.actualLocation}
              isGuessing={false}
              onMapClick={undefined}
            />
          </div>
          
          <div className="flex justify-between mt-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-gray-300">你的猜测</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-300">实际位置</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-300">距离差:</span>
              <span className="font-semibold">{distance.toFixed(2)} 公里</span>
            </div>
          </div>
        </div>

        {/* 成就区域 */}
        {questionResult.scoringDetails.achievements.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">获得成就</h3>
            
            <div className="flex flex-wrap gap-3">
              {questionResult.scoringDetails.achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500/30 to-amber-600/30 rounded-full flex items-center gap-2"
                >
                  <span className="text-lg">{getAchievementIcon(achievement)}</span>
                  <span className="text-yellow-300">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 日志数据 */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">接口返回数据</h3>
          
          <div className="bg-gray-900/50 rounded-lg p-4 overflow-auto max-h-60">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(questionResult, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};