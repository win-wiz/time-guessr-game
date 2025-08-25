"use client";

import { memo, useMemo, useCallback } from "react";
import Image from "next/image";
import { MapPin, Clock, Calendar, Target } from "lucide-react";
import { RoundScoreDisplay } from "@/components/game/round-score-display";

// Optimized feature card data
const FEATURE_CARDS = [
  {
    id: 'time',
    icon: Clock,
    title: 'Time Reasoning',
    description: 'Analyze historical photo details to deduce when events occurred',
    gradient: 'from-yellow-500 to-orange-600',
    delay: '0.5s'
  },
  {
    id: 'location',
    icon: MapPin,
    title: 'Location Pinpointing',
    description: 'Mark the exact location where you think historical events took place',
    gradient: 'from-blue-500 to-cyan-600',
    delay: '1s'
  },
  {
    id: 'year',
    icon: Calendar,
    title: 'Year Guessing',
    description: 'Use the slider to select the specific year you think the photo was taken',
    gradient: 'from-purple-500 to-pink-600',
    delay: '1.5s'
  }
] as const;

// Optimized feature card component
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

// Optimized loading animation component
const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <div className="w-40 h-40 mx-auto mb-8 relative">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-400 rounded-full animate-spin duration-1000"></div>
      
      {/* Middle rotating ring */}
      <div className="absolute inset-3 border-3 border-purple-500/20 rounded-full"></div>
      <div className="absolute inset-3 border-3 border-transparent border-t-purple-500 border-l-purple-400 rounded-full animate-spin duration-1500" style={{ animationDirection: 'reverse' }}></div>
      
      {/* Inner rotating ring */}
      <div className="absolute inset-6 border-2 border-indigo-500/20 rounded-full"></div>
      <div className="absolute inset-6 border-2 border-transparent border-t-indigo-500 border-b-indigo-400 rounded-full animate-spin duration-2000"></div>
      
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Target className="w-10 h-10 text-blue-400 animate-pulse duration-1000" />
          <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping duration-2000"></div>
        </div>
      </div>
      
      {/* Light effects */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse duration-3000"></div>
    </div>
  );
});

// Optimized bouncing dots component
const BouncingDots = memo(function BouncingDots() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce duration-600"></div>
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce duration-600" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce duration-600" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
});

// Optimized progress bar component
const LoadingProgressBar = memo(function LoadingProgressBar() {
  return (
    <div className="w-80 h-2 bg-gray-700/50 rounded-full mx-auto overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-pulse">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse duration-1500"></div>
      </div>
    </div>
  );
});

// Optimized background animation component
const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      {/* Floating light orb animations */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl animate-pulse duration-3000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl animate-pulse duration-4000" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse duration-5000" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Moving light rays */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse duration-2000"></div>
      <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500/50 to-transparent animate-pulse duration-2500" style={{ animationDelay: '1s' }}></div>
    </div>
  );
});

// Optimized header component with prop types
interface LoadingHeaderProps {
  currentRound?: number;
  totalRounds?: number;
  scores?: any[];
}

const LoadingHeader = memo(function LoadingHeader({
  currentRound = 1,
  totalRounds = 5,
  scores = []
}: LoadingHeaderProps) {
  return (
    <header className="relative z-50 bg-gradient-to-r from-slate-900/40 via-gray-800/30 to-slate-900/40 backdrop-blur-2xl border-b border-white/10">
      <div className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center animate-pulse">
            <Image
              src="/logo.svg"
              alt="TimeGuessr Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              TimeGuessr
            </h1>
            <div className="text-sm text-blue-200/90">Historical Time Machine</div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {/* Use unified Round and Score display component */}
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
  message = "Preparing game",
  currentRound = 1,
  totalRounds = 5,
  scores = []
}: LoadingStateProps) {
  // Use useMemo to cache feature card rendering
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

  // Memoize header props to prevent unnecessary re-renders
  const headerProps = useMemo(() => ({
    currentRound,
    totalRounds,
    scores
  }), [currentRound, totalRounds, scores]);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Dynamic background */}
      <AnimatedBackground />

      {/* Top navigation bar skeleton */}
      <LoadingHeader {...headerProps} />

      {/* Main content area */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Main loading animation */}
          <div className="relative">
            <LoadingSpinner />
          </div>

          {/* Loading text */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent animate-pulse">
              {message}
            </h2>
            
            {/* Dynamic dot indicators */}
            <BouncingDots />
            
            {/* Progress bar animation */}
            <LoadingProgressBar />
            
            <p className="text-gray-300 text-xl animate-pulse duration-2000">Loading historical event data...</p>
          </div>

          {/* Feature preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto px-4">
            {featureCards}
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="relative z-10 pb-8">
        <div className="text-center">
          <p className="text-gray-500 text-sm animate-pulse duration-3000">
            Game starting soon, please wait patiently...
          </p>
        </div>
      </div>
    </div>
  );
});