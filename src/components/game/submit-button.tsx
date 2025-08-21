"use client";

import { memo, useMemo } from "react";
import { Zap } from "lucide-react";

interface SubmitButtonProps {
  onSubmit: () => void;
  guessLocation: { lat: number; lng: number } | null;
  isMobile?: boolean;
}

export const SubmitButton = memo(function SubmitButton({ 
  onSubmit, 
  guessLocation, 
  isMobile = false 
}: SubmitButtonProps) {
  const buttonClass = useMemo(() => {
    const baseClass = `${isMobile ? 'w-full py-4 rounded-2xl' : 'px-8 py-3 rounded-full'} text-lg font-bold transition-all duration-300 shadow-xl border-2`;
    const enabledClass = 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-600 text-white border-blue-400/50 transform hover:scale-105';
    const disabledClass = 'bg-gray-700/60 text-gray-400 border-gray-600/40 cursor-not-allowed';
    
    return `${baseClass} ${guessLocation ? enabledClass : disabledClass}`;
  }, [guessLocation, isMobile]);

  return (
    <button
      onClick={onSubmit}
      disabled={!guessLocation}
      className={buttonClass}
      tabIndex={0}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-center gap-2">
        <Zap className="w-5 h-5" />
        {guessLocation ? '🎯 提交猜测' : '请先在地图上选择位置'}
      </div>
      {guessLocation && !isMobile && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-indigo-600/20 animate-pulse"></div>
      )}
    </button>
  );
});