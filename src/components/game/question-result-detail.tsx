"use client";

import { useState, useEffect } from "react";
// import Image from "next/image";
import { MapPin, Clock, Calendar, Award, Target, Navigation } from "lucide-react";
import { GameMap } from "@/components/game-map";
import { GameImage } from "../game-image";

// 添加动画样式
const fadeInUp = "animate-[fadeInUp_0.6s_ease-out_forwards]";
const slideInLeft = "animate-[slideInLeft_0.8s_ease-out_forwards]";
const slideInRight = "animate-[slideInRight_0.8s_ease-out_forwards]";
const scaleIn = "animate-[scaleIn_0.5s_ease-out_forwards]";
const bounceIn = "animate-[bounceIn_0.7s_ease-out_forwards]";

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
      image_url?: string;
      event_name?: string;
      event_detail?: string;
      event_descript?: string;
      difficulty?: string;
    };
    // 兼容旧版本的字段名
    eventDetails?: {
      description: string;
      imageUrl: string;
      image_url?: string;
      eventName?: string;
      event_name?: string;
      eventDetail?: string;
      event_detail?: string;
      event_descript?: string;
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
      image_url?: string;
      event_name?: string;
      event_detail?: string;
      event_descript?: string;
      difficulty?: string;
    };
  };
  onClose?: () => void;
  onNextQuestion?: () => void;
  hasNextQuestion?: boolean; // 新增：是否还有下一题
}

export const QuestionResultDetail: React.FC<QuestionResultDetailProps> = ({ 
  questionResult, 
  onClose,
  onNextQuestion,
  hasNextQuestion = true
}) => {
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 计算距离
  const distance = calculateDistance(
    questionResult.guessedLocation.lat,
    questionResult.guessedLocation.lng,
    questionResult.actualLocation.lat,
    questionResult.actualLocation.lng
  );

  useEffect(() => {
    // 使用问题结果中包含的事件详情
    if (questionResult.event) {
      // 优先使用 event 字段
      setEventDetails(questionResult.event);
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
        {/* 优化的标题区域 - 更紧凑的布局 */}
        <div className={`relative mb-6 ${fadeInUp}`}>
          {/* 主标题栏 */}
          <div className="bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {/* 左侧：题目信息 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                  {questionResult.questionNumber}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">题目详细结果</h2>
                  <div className="text-sm text-gray-300">第 {questionResult.questionNumber} 题分析</div>
                </div>
              </div>
              
              {/* 右侧：得分卡片 */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">最终得分</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {questionResult.scoringDetails.finalScore}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">等级</div>
                    <div className={`text-xl font-bold ${getRankColor(questionResult.scoringDetails.rank)}`}>
                      {questionResult.scoringDetails.rank}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 快速统计栏 */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-2 text-center border border-blue-500/30">
              <div className="text-xs text-blue-300">答题时间</div>
              <div className="text-sm font-bold text-white">{questionResult.answerTime}s</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-2 text-center border border-purple-500/30">
              <div className="text-xs text-purple-300">年份误差</div>
              <div className="text-sm font-bold text-white">±{Math.abs(questionResult.guessedYear - questionResult.actualYear)}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-2 text-center border border-green-500/30">
              <div className="text-xs text-green-300">位置距离</div>
              <div className="text-sm font-bold text-white">{distance.toFixed(0)}km</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-2 text-center border border-yellow-500/30">
              <div className="text-xs text-yellow-300">连击数</div>
              <div className="text-sm font-bold text-white">{questionResult.scoringDetails.streak}</div>
            </div>
          </div>
        </div>

        {/* 核心对比区域 - 图片与地图紧密排列 */}
        <div className="relative mb-8">
          {/* <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            视觉对比分析
          </h3> */}
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* 左侧：图片与事件信息重叠布局 */}
            <div className={`relative group ${slideInLeft} hover-lift glow-effect`}>
              <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-500 group-hover:border-blue-400/50">
                {eventDetails?.image_url ? (
                  <GameImage imageUrl={eventDetails.image_url} eventName={eventDetails.event_name} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className={`text-center ${bounceIn}`}>
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400">图片加载中...</p>
                    </div>
                  </div>
                )}
                
                {/* 悬浮信息卡片 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-yellow-400 animate-pulse" />
                      <span className="text-xl font-bold text-yellow-400">{questionResult.actualYear}</span>
                      <span className="text-gray-300">年</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-red-400" />
                      <span className="text-lg font-semibold text-white">{eventDetails?.city || "未知地点"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：地图与数据重叠布局 - 响应式高度 */}
            <div className={`relative group ${slideInRight} hover-lift glow-effect`}>
              <div className="relative h-[300px] sm:h-[350px] md:h-[400px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-500 group-hover:border-green-400/50">
                <GameMap
                  guessLocation={questionResult.guessedLocation}
                  actualLocation={questionResult.actualLocation}
                  isGuessing={false}
                  onMapClick={undefined}
                />
                
                {/* 优化的紧凑型城市信息面板 - 左上角 */}
                <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-white/20 shadow-lg ${scaleIn} max-w-[150px] sm:max-w-[200px]`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-white truncate">
                        {eventDetails?.city || "历史地点"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 年份对比面板 - 右上角紧凑布局 */}
                <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 ${scaleIn}`}>
                  <div className="bg-red-500/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-red-400/60 min-w-[60px] sm:min-w-[80px]">
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-red-100 mb-0.5 sm:mb-1">你的猜测</div>
                      <div className="text-sm sm:text-lg font-bold text-white">{questionResult.guessedYear}</div>
                    </div>
                  </div>
                  <div className="bg-green-500/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-green-400/60 min-w-[60px] sm:min-w-[80px]">
                    <div className="text-center">
                      <div className="text-[10px] sm:text-xs text-green-100 mb-0.5 sm:mb-1">实际年份</div>
                      <div className="text-sm sm:text-lg font-bold text-white">{questionResult.actualYear}</div>
                    </div>
                  </div>
                </div>

                {/* 距离信息面板 - 调整到右侧偏下位置 */}
                <div className={`absolute right-2 sm:right-3 bottom-12 sm:bottom-10 bg-blue-500/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-blue-400/60 ${bounceIn} max-w-[120px] sm:max-w-[160px]`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-400 rounded-full flex items-center justify-center">
                      <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] sm:text-xs text-blue-100">位置误差</div>
                      <div className="text-sm sm:text-lg font-bold text-white">{distance.toFixed(1)} km</div>
                    </div>
                  </div>
                </div>

                {/* 简化的距离可视化条 - 移到左下角避免与Google标识重叠 */}
                <div className={`absolute bottom-12 sm:bottom-14 left-2 sm:left-3 bg-black/70 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20 ${bounceIn}`}>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-[140px] sm:min-w-[180px]">
                    <span className="text-[10px] sm:text-xs text-gray-300 whitespace-nowrap">精确</span>
                    <div className="flex-1 bg-gray-600/80 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-1.5 sm:h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${Math.min((distance / 1000) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-300 whitespace-nowrap">较远</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 事件信息展示区域 - 位于图片和地图下方 */}
        {(eventDetails?.event_detail || eventDetails?.description || eventDetails?.city) && (
          <div className={`mb-8 ${fadeInUp}`}>
            <div className="bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {eventDetails.event_name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {questionResult.actualYear} 年
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 事件描述 */}
              {(eventDetails?.event_detail || eventDetails?.description) && (
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-200">
                    <span>📖</span>
                    事件描述
                  </h4>
                  <p className="text-gray-200 leading-relaxed">
                    {eventDetails.event_descript || eventDetails.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 综合分析区域 - 整合所有统计信息 */}
        <div className={`mb-8 ${fadeInUp}`}>
          <h3 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📊 综合分析报告
          </h3>
          
          {/* 得分构成分析 */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-white/10 mb-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              得分构成详情
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{questionResult.scoringDetails.timeScore}</div>
                <div className="text-sm text-gray-400">时间分</div>
                <div className="text-xs text-gray-500 mt-1">基于 {questionResult.answerTime}s 答题</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{questionResult.scoringDetails.locationScore}</div>
                <div className="text-sm text-gray-400">位置分</div>
                <div className="text-xs text-gray-500 mt-1">误差 {distance.toFixed(0)}km</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{questionResult.scoringDetails.bonusScore}</div>
                <div className="text-sm text-gray-400">奖励分</div>
                <div className="text-xs text-gray-500 mt-1">各种加成</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{questionResult.scoringDetails.streak}</div>
                <div className="text-sm text-gray-400">连击数</div>
                <div className="text-xs text-gray-500 mt-1">连续答对</div>
              </div>
            </div>
          </div>

          {/* 成就与表现分析 */}
          {questionResult.scoringDetails.achievements.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 border border-yellow-500/30">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                本题获得成就 ({questionResult.scoringDetails.achievements.length}个)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questionResult.scoringDetails.achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-yellow-500/20"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full 
                                  flex items-center justify-center text-lg">
                      {getAchievementIcon(achievement)}
                    </div>
                    <div className="flex-1">
                      <div className="text-yellow-300 font-medium">{achievement}</div>
                      <div className="text-xs text-gray-400">成就解锁</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 固定底部悬浮按钮栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 fixed-bottom-actions bg-gradient-to-t from-black/95 via-black/80 to-transparent">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {/* 下一题按钮 - 根据hasNextQuestion参数决定是否显示 */}
            {hasNextQuestion && (
              <button 
                onClick={() => {
                  if (onNextQuestion) {
                    onNextQuestion();
                  } else {
                    // 回退方案：如果没有提供回调，则使用页面跳转
                    window.location.href = '/game';
                  }
                }}
                className="action-button w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 
                         hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl 
                         transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                         hover:shadow-blue-500/25 flex items-center justify-center gap-3 group
                         focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
              >
                <span className="text-lg">➡️</span>
                <span>下一题</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-pulse"></div>
              </button>
            )}

            {/* 重新开始按钮 */}
            <button 
              onClick={() => {
                if (confirm('确定要重新开始游戏吗？当前进度将会丢失。')) {
                  localStorage.clear();
                  window.location.href = '/game';
                }
              }}
              className="action-button w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 
                       hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl 
                       transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                       hover:shadow-purple-500/25 flex items-center justify-center gap-3 group
                       focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
            >
              <span className="text-lg">🔄</span>
              <span>重新开始</span>
              <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-spin"></div>
            </button>

            {/* 分享结果按钮 */}
            <button 
              onClick={() => {
                const shareText = `我在时光猜测游戏中获得了 ${questionResult.scoringDetails.finalScore} 分！等级：${questionResult.scoringDetails.rank}`;
                if (navigator.share) {
                  navigator.share({
                    title: '时光猜测游戏结果',
                    text: shareText,
                    url: window.location.href
                  }).catch(() => {
                    // 如果分享失败，回退到复制
                    navigator.clipboard.writeText(shareText + ' ' + window.location.href);
                    alert('结果已复制到剪贴板！');
                  });
                } else {
                  navigator.clipboard.writeText(shareText + ' ' + window.location.href);
                  alert('结果已复制到剪贴板！');
                }
              }}
              className="action-button w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 
                       hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl 
                       transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                       hover:shadow-green-500/25 flex items-center justify-center gap-3 group
                       focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
            >
              <span className="text-lg">📤</span>
              <span>分享结果</span>
              <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-bounce"></div>
            </button>

            {/* 关闭按钮 */}
            {onClose && (
              <button 
                onClick={onClose}
                className="action-button w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 
                         hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl 
                         transition-all duration-300 transform hover:scale-105 hover:shadow-xl 
                         hover:shadow-gray-500/25 flex items-center justify-center gap-3 group
                         focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                <span className="text-lg">✕</span>
                <span>关闭</span>
              </button>
            )}
          </div>

          {/* 快速操作提示 */}
          <div className="mt-3 text-center animate-pulse">
            <p className="text-xs text-gray-400">
              💡 提示：按钮固定在底部，随时可以快速操作
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
