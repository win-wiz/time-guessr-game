// 评分工具函数，基于评分机制设计文档

export interface DetailedScore {
  timeScore: number;
  locationScore: number;
  bonusScore: number;
  finalScore: number;
  timeRank: string;
  locationRank: string;
  achievements: string[];
}

// 时间评分等级判断
export function getTimeRank(yearDiff: number): { rank: string; color: string } {
  if (yearDiff === 0) return { rank: "完美", color: "text-yellow-400" };
  if (yearDiff <= 1) return { rank: "优秀", color: "text-green-400" };
  if (yearDiff <= 3) return { rank: "很好", color: "text-blue-400" };
  if (yearDiff <= 5) return { rank: "良好", color: "text-purple-400" };
  if (yearDiff <= 10) return { rank: "一般", color: "text-orange-400" };
  if (yearDiff <= 20) return { rank: "较差", color: "text-red-400" };
  return { rank: "很差", color: "text-gray-400" };
}

// 地理评分等级判断
export function getLocationRank(distance: number): { rank: string; color: string } {
  if (distance <= 0.1) return { rank: "完美", color: "text-yellow-400" };
  if (distance <= 1) return { rank: "优秀", color: "text-green-400" };
  if (distance <= 5) return { rank: "很好", color: "text-blue-400" };
  if (distance <= 25) return { rank: "良好", color: "text-purple-400" };
  if (distance <= 100) return { rank: "一般", color: "text-orange-400" };
  if (distance <= 500) return { rank: "较差", color: "text-red-400" };
  return { rank: "很差", color: "text-gray-400" };
}

// 计算详细评分
export function calculateDetailedScore(
  distance: number, 
  yearDiff: number, 
  answerTime: number,
  streak: number = 0
): DetailedScore {
  // 时间得分计算
  let timeScore = 1000;
  if (yearDiff === 0) {
    timeScore = 1000;
  } else if (yearDiff <= 1) {
    timeScore = Math.max(0, 1000 - yearDiff * 10);
  } else if (yearDiff <= 5) {
    timeScore = Math.max(0, 1000 - yearDiff * 15);
  } else if (yearDiff <= 10) {
    timeScore = Math.max(0, 1000 - yearDiff * 20);
  } else {
    timeScore = Math.max(0, 1000 - yearDiff * 25);
  }

  // 地理得分计算
  let locationScore = 1000;
  if (distance <= 1) {
    locationScore = Math.max(0, 1000 - distance * 5);
  } else if (distance <= 10) {
    locationScore = Math.max(0, 1000 - distance * 10);
  } else if (distance <= 100) {
    locationScore = Math.max(0, 1000 - distance * 15);
  } else {
    locationScore = Math.max(0, 1000 - distance * 20);
  }

  // 基础综合评分 (时间60% + 地理40%)
  const baseScore = timeScore * 0.6 + locationScore * 0.4;

  // 速度奖励
  const speedBonus = Math.max(0, (120 - answerTime) * 5);
  
  // 完美奖励
  let perfectBonus = 0;
  if (yearDiff === 0 && distance <= 0.1) {
    perfectBonus = 500; // 双维度完美
  } else if (yearDiff === 0 || distance <= 0.1) {
    perfectBonus = 200; // 单维度完美
  }

  // 连击奖励
  const streakBonus = Math.min(streak * 50, 500);

  // 总奖励分数
  const bonusScore = speedBonus + perfectBonus + streakBonus;

  // 最终得分
  const finalScore = Math.round(baseScore + bonusScore);

  // 成就判断
  const achievements: string[] = [];
  if (speedBonus >= 450) achievements.push("闪电侠");
  if (perfectBonus === 500) achievements.push("完美主义者");
  if (perfectBonus === 200) achievements.push("单项完美");
  if (streakBonus > 0) achievements.push(`${streak}连击`);
  if (speedBonus > 0) achievements.push("速度奖励");

  return {
    timeScore: Math.round(timeScore),
    locationScore: Math.round(locationScore),
    bonusScore,
    finalScore,
    timeRank: getTimeRank(yearDiff).rank,
    locationRank: getLocationRank(distance).rank,
    achievements
  };
}

// 格式化距离显示
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}米`;
  }
  return `${distance.toFixed(1)}公里`;
}

// 格式化时间显示
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}分${remainingSeconds}秒`;
}