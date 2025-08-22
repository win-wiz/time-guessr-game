// Scoring utility functions based on scoring mechanism design document

export interface DetailedScore {
  timeScore: number;
  locationScore: number;
  bonusScore: number;
  finalScore: number;
  timeRank: string;
  locationRank: string;
  achievements: string[];
}

// Constants for performance optimization
const BASE_SCORE = 1000;
const TIME_WEIGHT = 0.6;
const LOCATION_WEIGHT = 0.4;
const SPEED_MULTIPLIER = 5;
const SPEED_THRESHOLD = 120;
const STREAK_MULTIPLIER = 50;
const MAX_STREAK_BONUS = 500;
const PERFECT_DUAL_BONUS = 500;
const PERFECT_SINGLE_BONUS = 200;
const PERFECT_DISTANCE_THRESHOLD = 0.1;
const SPEED_ACHIEVEMENT_THRESHOLD = 450;

// Rank configurations for better performance
const TIME_RANKS = [
  { threshold: 0, rank: "Perfect", color: "text-yellow-400" },
  { threshold: 1, rank: "Excellent", color: "text-green-400" },
  { threshold: 3, rank: "Very Good", color: "text-blue-400" },
  { threshold: 5, rank: "Good", color: "text-purple-400" },
  { threshold: 10, rank: "Average", color: "text-orange-400" },
  { threshold: 20, rank: "Poor", color: "text-red-400" },
  { threshold: Infinity, rank: "Very Poor", color: "text-gray-400" }
];

const LOCATION_RANKS = [
  { threshold: 0.1, rank: "Perfect", color: "text-yellow-400" },
  { threshold: 1, rank: "Excellent", color: "text-green-400" },
  { threshold: 5, rank: "Very Good", color: "text-blue-400" },
  { threshold: 25, rank: "Good", color: "text-purple-400" },
  { threshold: 100, rank: "Average", color: "text-orange-400" },
  { threshold: 500, rank: "Poor", color: "text-red-400" },
  { threshold: Infinity, rank: "Very Poor", color: "text-gray-400" }
];

// Time scoring rank determination - optimized with lookup
export function getTimeRank(yearDiff: number): { rank: string; color: string } {
  for (const rankConfig of TIME_RANKS) {
    if (yearDiff <= rankConfig.threshold) {
      return { rank: rankConfig.rank, color: rankConfig.color };
    }
  }
  return TIME_RANKS[TIME_RANKS.length - 1];
}

// Geographic scoring rank determination - optimized with lookup
export function getLocationRank(distance: number): { rank: string; color: string } {
  for (const rankConfig of LOCATION_RANKS) {
    if (distance <= rankConfig.threshold) {
      return { rank: rankConfig.rank, color: rankConfig.color };
    }
  }
  return LOCATION_RANKS[LOCATION_RANKS.length - 1];
}

// Calculate detailed score - optimized for performance
export function calculateDetailedScore(
  distance: number, 
  yearDiff: number, 
  answerTime: number,
  streak: number = 0
): DetailedScore {
  // Time score calculation - optimized with early returns
  let timeScore: number;
  if (yearDiff === 0) {
    timeScore = BASE_SCORE;
  } else if (yearDiff <= 1) {
    timeScore = Math.max(0, BASE_SCORE - yearDiff * 10);
  } else if (yearDiff <= 5) {
    timeScore = Math.max(0, BASE_SCORE - yearDiff * 15);
  } else if (yearDiff <= 10) {
    timeScore = Math.max(0, BASE_SCORE - yearDiff * 20);
  } else {
    timeScore = Math.max(0, BASE_SCORE - yearDiff * 25);
  }

  // Geographic score calculation - optimized with early returns
  let locationScore: number;
  if (distance <= 1) {
    locationScore = Math.max(0, BASE_SCORE - distance * 5);
  } else if (distance <= 10) {
    locationScore = Math.max(0, BASE_SCORE - distance * 10);
  } else if (distance <= 100) {
    locationScore = Math.max(0, BASE_SCORE - distance * 15);
  } else {
    locationScore = Math.max(0, BASE_SCORE - distance * 20);
  }

  // Base composite score (time 60% + geography 40%)
  const baseScore = timeScore * TIME_WEIGHT + locationScore * LOCATION_WEIGHT;

  // Speed bonus
  const speedBonus = Math.max(0, (SPEED_THRESHOLD - answerTime) * SPEED_MULTIPLIER);
  
  // Perfect bonus - optimized conditions
  const isPerfectTime = yearDiff === 0;
  const isPerfectLocation = distance <= PERFECT_DISTANCE_THRESHOLD;
  let perfectBonus: number;
  if (isPerfectTime && isPerfectLocation) {
    perfectBonus = PERFECT_DUAL_BONUS; // Dual dimension perfect
  } else if (isPerfectTime || isPerfectLocation) {
    perfectBonus = PERFECT_SINGLE_BONUS; // Single dimension perfect
  } else {
    perfectBonus = 0;
  }

  // Streak bonus
  const streakBonus = Math.min(streak * STREAK_MULTIPLIER, MAX_STREAK_BONUS);

  // Total bonus score
  const bonusScore = speedBonus + perfectBonus + streakBonus;

  // Final score
  const finalScore = Math.round(baseScore + bonusScore);

  // Achievement determination - optimized with early checks
  const achievements: string[] = [];
  if (speedBonus >= SPEED_ACHIEVEMENT_THRESHOLD) achievements.push("Lightning");
  if (perfectBonus === PERFECT_DUAL_BONUS) achievements.push("Perfectionist");
  if (perfectBonus === PERFECT_SINGLE_BONUS) achievements.push("Single Perfect");
  if (streakBonus > 0) achievements.push(`${streak} Streak`);
  if (speedBonus > 0) achievements.push("Speed Bonus");

  // Cache rank calculations
  const timeRankResult = getTimeRank(yearDiff);
  const locationRankResult = getLocationRank(distance);

  return {
    timeScore: Math.round(timeScore),
    locationScore: Math.round(locationScore),
    bonusScore,
    finalScore,
    timeRank: timeRankResult.rank,
    locationRank: locationRankResult.rank,
    achievements
  };
}

// Format distance display - optimized with constants
const METERS_PER_KM = 1000;
const SECONDS_PER_MINUTE = 60;

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * METERS_PER_KM)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

// Format time display - optimized
export function formatTime(seconds: number): string {
  if (seconds < SECONDS_PER_MINUTE) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  return `${minutes}m${remainingSeconds}s`;
}