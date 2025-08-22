"use client";

import { memo } from "react";
import { Progress } from "@/components/ui/progress";
import { GameScore } from "@/lib/local-storage";

interface RoundScoreDisplayProps {
  currentRound: number;
  totalRounds: number;
  scores: GameScore[];
  variant?: 'default' | 'loading' | 'compact';
  showProgress?: boolean;
  className?: string;
}

export const RoundScoreDisplay = memo(function RoundScoreDisplay({
  currentRound,
  totalRounds,
  scores,
  variant = 'default',
  showProgress = true,
  className = ''
}: RoundScoreDisplayProps) {
  // 计算总分数
  const totalScore = scores.reduce((sum, round) => sum + round.score, 0);
  
  // 添加调试日志
  console.log('[RoundScoreDisplay] Rendering with:', {
    currentRound,
    totalRounds,
    scoresCount: scores.length,
    scores: scores.map(s => ({ score: s.score, yearDiff: s.yearDifference })),
    totalScore
  });
  
  // 计算进度百分比
  const progressValue = totalRounds > 0 ? (currentRound / totalRounds) * 100 : 0;
  
  // 根据变体选择样式
  const getVariantStyles = () => {
    switch (variant) {
      case 'loading':
        return {
          container: 'flex items-center gap-4 text-gray-300',
          roundText: 'text-sm',
          scoreText: 'text-sm',
          progressBar: 'w-32 h-2 bg-gray-700/50'
        };
      case 'compact':
        return {
          container: 'flex items-center gap-3',
          roundText: 'text-xs font-medium',
          scoreText: 'text-xs font-bold',
          progressBar: 'w-24 h-1.5'
        };
      default:
        return {
          container: 'flex items-center gap-4',
          roundText: 'text-sm font-medium',
          scoreText: 'text-sm font-bold',
          progressBar: 'w-32 h-2'
        };
    }
  };
  
  const styles = getVariantStyles();
  
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Round 显示 */}
      <div className={styles.roundText}>
        Round {currentRound}/{totalRounds}
      </div>
      
      {/* Score 显示 */}
      {/* <div className="flex items-center gap-2">
        <span className={styles.roundText}>Score:</span>
        <span className={styles.scoreText}>{totalScore}</span>
      </div> */}
      
      {/* 进度条 */}
      {showProgress && (
        <div className={styles.progressBar}>
          <Progress 
            value={progressValue} 
            className={variant === 'loading' ? 'h-2' : 'h-2'}
          />
        </div>
      )}
    </div>
  );
});

// 导出类型定义供其他组件使用
export type { RoundScoreDisplayProps };