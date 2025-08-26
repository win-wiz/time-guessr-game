"use client";

import { memo, useMemo } from "react";
import { Zap, Loader2 } from "lucide-react";

interface SubmitButtonProps {
  onSubmit: () => void;
  guessLocation: { lat: number; lng: number } | null;
  isMobile?: boolean;
  isLoading?: boolean;
}

export const SubmitButton = memo(function SubmitButton({ 
  onSubmit, 
  guessLocation, 
  isMobile = false,
  isLoading = false
}: SubmitButtonProps) {
  const buttonClass = useMemo(() => {
    const baseClass = `${isMobile ? 'py-4 rounded-2xl' : 'px-8 py-3 rounded-xl'} w-full text-lg font-bold transition-all duration-300 shadow-2xl border-2 relative overflow-hidden`;
    const enabledClass = 'bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-400 hover:via-blue-400 hover:to-purple-500 text-white border-emerald-400/50 hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]';
    const loadingClass = 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white border-blue-400/50 cursor-not-allowed';
    const disabledClass = 'bg-slate-700/80 text-slate-400 border-slate-600/50 cursor-not-allowed backdrop-blur-sm';
    
    if (isLoading) {
      return `${baseClass} ${loadingClass}`;
    }
    
    return `${baseClass} ${guessLocation ? enabledClass : disabledClass}`;
  }, [guessLocation, isMobile, isLoading]);

  const buttonText = useMemo(() => {
    if (isLoading) return 'Submitting...';
    if (guessLocation) return '🎯 Submit Guess';
    return 'Select location first';
  }, [isLoading, guessLocation]);

  return (
    <button
      onClick={onSubmit}
      disabled={!guessLocation || isLoading}
      className={buttonClass}
      tabIndex={0}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-center gap-3 relative z-10">
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Zap className={`w-6 h-6 ${guessLocation ? 'animate-pulse' : ''}`} />
        )}
        <span className="font-semibold">{buttonText}</span>
      </div>
      {guessLocation && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-purple-500/20 animate-pulse"></div>
      )}
    </button>
  );
});