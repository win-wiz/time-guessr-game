"use client";

import { memo, useMemo } from "react";
import { MapPin, Clock, Calendar, Target } from "lucide-react";
import { RoundScoreDisplay } from "@/components/game/round-score-display";

// 优化的功能卡片数据
const FEATURE_CARDS = [
  {
    id: 'time',
    icon: Clock,
    title: '时间推理',
    description: '通过观察历史照片中的细节，推测事件发生的年代',
    gradient: 'from-yellow-500 to-orange-600',
    delay: '0.5s'
  },
  {
    id: 'location',
    icon: MapPin,
    title: '地点定位',
    description: '在地图上标记你认为历史事件发生的具体位置',
    gradient: 'from-blue-500 to-cyan-600',
    delay: '1s'
  },
  {
    id: 'year',
    icon: Calendar,
    title: '年份猜测',
    description: '使用滑块选择你认为照片拍摄的具体年份',
    gradient: 'from-purple-500 to-pink-600',
    delay: '1.5s'
  }
] as const;

// 优化的功能卡片组件
const FeatureCard = memo(function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  gradient 
}: {
  icon: typeof Clock;
  title: string;
  description: string;
  gradient: string;
}) {
  const iconBgClass = useMemo(() => 
    `w-10 h-10 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center`,
    [gradient]
  );

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl transition-all duration-300 hover:border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <div className={iconBgClass}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
});

// 优化的加载动画组件
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="w-40 h-40 mx-auto mb-8 relative">
      {/* 外层旋转环 */}
      <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-400 rounded-full animate-spin duration-1000"></div>
      
      {/* 中层旋转环 */}
      <div className="absolute inset-3 border-3 border-purple-500/20 rounded-full"></div>
      <div className="absolute inset-3 border-3 border-transparent border-t-purple-500 border-l-purple-400 rounded-full animate-spin duration-1500" style={{ animationDirection: 'reverse' }}></div>
      
      {/* 内层旋转环 */}
      <div className="absolute inset-6 border-2 border-indigo-500/20 rounded-full"></div>
      <div className="absolute inset-6 border-2 border-transparent border-t-indigo-500 border-b-indigo-400 rounded-full animate-spin duration-2000"></div>
      
      {/* 中心图标 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Target className="w-10 h-10 text-blue-400 animate-pulse duration-1000" />
          <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping duration-2000"></div>
        </div>
      </div>
      
      {/* 光效 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse duration-3000"></div>
    </div>
  );
});

// 优化的跳动点组件
const BouncingDots = memo(function BouncingDots() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce duration-600"></div>
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce duration-600" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce duration-600" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
});

// 优化的进度条组件
const LoadingProgressBar = memo(function LoadingProgressBar() {
  return (
    <div className="w-80 h-2 bg-gray-700/50 rounded-full mx-auto overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-pulse">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse duration-1500"></div>
      </div>
    </div>
  );
});

// 优化的背景动画组件
const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      {/* 浮动光球动画 */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl animate-pulse duration-3000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl animate-pulse duration-4000" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse duration-5000" style={{ animationDelay: '0.5s' }}></div>
      
      {/* 移动的光线 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse duration-2000"></div>
      <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500/50 to-transparent animate-pulse duration-2500" style={{ animationDelay: '1s' }}></div>
    </div>
  );
});

// 优化的头部组件
const LoadingHeader = memo(function LoadingHeader({
  currentRound = 1,
  totalRounds = 5,
  scores = []
}: {
  currentRound?: number;
  totalRounds?: number;
  scores?: any[];
}) {
  return (
    <header className="relative z-50 bg-gradient-to-r from-slate-900/40 via-gray-800/30 to-slate-900/40 backdrop-blur-2xl border-b border-white/10">
      <div className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl border-2 border-blue-400/30 animate-pulse">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              CalgaryGuessr
            </h1>
            <div className="text-sm text-blue-200/90">历史时光机</div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {/* 使用统一的Round和Score显示组件 */}
          <RoundScoreDisplay
            currentRound={currentRound}
            totalRounds={totalRounds}
            scores={scores}
            variant="loading"
            showProgress={true}
            className="animate-pulse"
          />
        </div>
      </div>
    </header>
  );
});

interface LoadingStateProps {
  message?: string;
  currentRound?: number;
  totalRounds?: number;
  scores?: any[];
}

export const LoadingState = memo(function LoadingState({ 
  message = "正在准备游戏",
  currentRound = 1,
  totalRounds = 5,
  scores = []
}: LoadingStateProps) {
  // 使用 useMemo 缓存功能卡片渲染
  const featureCards = useMemo(() => 
    FEATURE_CARDS.map((card) => (
      <FeatureCard
        key={card.id}
        icon={card.icon}
        title={card.title}
        description={card.description}
        gradient={card.gradient}
      />
    )),
    []
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* 动态背景 */}
      <AnimatedBackground />

      {/* 顶部导航栏骨架 */}
      <LoadingHeader 
        currentRound={currentRound}
        totalRounds={totalRounds}
        scores={scores}
      />

      {/* 主要内容区域 */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* 主要加载动画 */}
          <div className="relative">
            <LoadingSpinner />
          </div>

          {/* 加载文本 */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent animate-pulse">
              {message}
            </h2>
            
            {/* 动态点状指示器 */}
            <BouncingDots />
            
            {/* 进度条动画 */}
            <LoadingProgressBar />
            
            <p className="text-gray-300 text-xl animate-pulse duration-2000">加载历史事件数据中...</p>
          </div>

          {/* 功能预览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto px-4">
            {featureCards}
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="relative z-10 pb-8">
        <div className="text-center">
          <p className="text-gray-500 text-sm animate-pulse duration-3000">
            游戏即将开始，请耐心等待...
          </p>
        </div>
      </div>
    </div>
  );
});