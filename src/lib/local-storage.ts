// 本地存储服务 - 统一管理游戏数据的本地存储
import { EventDetail } from './api-service';

// 存储键名常量
const STORAGE_KEYS = {
  GAME_PROGRESS: 'time_guessr_game_progress',
  PLAYER_SETTINGS: 'time_guessr_player_settings',
  GAME_HISTORY: 'time_guessr_game_history',
  PLAYER_STATS: 'time_guessr_player_stats',
  CACHE_PREFIX: 'time_guessr_cache_',
} as const;

// 游戏分数接口
export interface GameScore {
  score: number;
  distance: number;
  yearDifference: number;
  event: {
    id: number;
    city: string;
    latitude: number;
    longitude: number;
    year: number;
    event_name: string;
    event_detail: string;
    event_description: string;
    image_url: string;
  };
  guessedYear: number;
  actualLat: number;
  actualLng: number;
}

// 游戏进度接口
export interface GameProgress {
  gameSessionId: string;
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  eventIds: string[];
  events: EventDetail[];
  scores: GameScore[];
  questionSessionIds: string[];
  startTime: number;
  lastSaveTime: number;
  gameMode: 'timed' | 'untimed';
  timeLimit?: number;
}

// 玩家设置接口
export interface PlayerSettings {
  defaultGameMode: 'timed' | 'untimed';
  defaultQuestionCount: number;
  defaultTimeLimit: number;
  soundEnabled: boolean;
  mapExpanded: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoSave: boolean;
  showHints: boolean;
}

// 游戏历史记录接口
export interface GameHistory {
  gameId: string;
  completedAt: number;
  totalScore: number;
  totalRounds: number;
  gameMode: string;
  timeLimit?: number;
  scores: GameScore[];
  duration: number; // 游戏总时长（秒）
}

// 玩家统计接口
export interface PlayerStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  gamesCompleted: number;
  totalPlayTime: number; // 总游戏时间（秒）
  lastPlayed: number;
  streakCurrent: number; // 当前连胜
  streakBest: number; // 最佳连胜
  favoriteGameMode: string;
  achievements: string[];
}

// 本地存储工具类
class LocalStorageManager {
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  // 安全的存储操作
  private safeSetItem(key: string, value: string): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('LocalStorage write failed:', error);
      return false;
    }
  }

  private safeGetItem(key: string): string | null {
    if (!this.isClient) return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('LocalStorage read failed:', error);
      return null;
    }
  }

  private safeRemoveItem(key: string): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
      return false;
    }
  }

  // 通用的JSON存储方法
  setJSON<T>(key: string, data: T): boolean {
    try {
      const jsonString = JSON.stringify(data);
      return this.safeSetItem(key, jsonString);
    } catch (error) {
      console.error('JSON serialization failed:', error);
      return false;
    }
  }

  getJSON<T>(key: string, defaultValue?: T): T | null {
    try {
      const jsonString = this.safeGetItem(key);
      if (jsonString === null) return defaultValue || null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('JSON deserialization failed:', error);
      return defaultValue || null;
    }
  }

  remove(key: string): boolean {
    return this.safeRemoveItem(key);
  }

  // 清除所有游戏相关数据
  clearAll(): boolean {
    const keys = Object.values(STORAGE_KEYS);
    let success = true;
    
    keys.forEach(key => {
      if (!this.remove(key)) {
        success = false;
      }
    });

    // 清除缓存数据
    if (this.isClient) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEYS.CACHE_PREFIX)) {
          this.remove(key);
        }
      });
    }

    return success;
  }

  // 获取存储使用情况
  getStorageInfo(): { used: number; available: number; total: number } {
    if (!this.isClient) {
      return { used: 0, available: 0, total: 0 };
    }

    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // 估算可用空间（大多数浏览器限制为5-10MB）
      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;

      return { used, available, total };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }
}

// 创建全局实例
const storageManager = new LocalStorageManager();

// 游戏进度管理
export class GameProgressManager {
  // 保存游戏进度
  static saveProgress(progress: GameProgress): boolean {
    const progressWithTimestamp = {
      ...progress,
      lastSaveTime: Date.now()
    };
    
    return storageManager.setJSON(STORAGE_KEYS.GAME_PROGRESS, progressWithTimestamp);
  }

  // 加载游戏进度
  static loadProgress(): GameProgress | null {
    const progress = storageManager.getJSON<GameProgress>(STORAGE_KEYS.GAME_PROGRESS);
    
    // 检查进度是否过期（24小时）
    if (progress && progress.lastSaveTime) {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24小时
      
      if (now - progress.lastSaveTime > maxAge) {
        this.clearProgress();
        return null;
      }
    }
    
    return progress;
  }

  // 清除游戏进度
  static clearProgress(): boolean {
    return storageManager.remove(STORAGE_KEYS.GAME_PROGRESS);
  }

  // 检查是否有保存的进度
  static hasProgress(): boolean {
    return this.loadProgress() !== null;
  }

  // 更新特定字段
  static updateProgress(updates: Partial<GameProgress>): boolean {
    const currentProgress = this.loadProgress();
    if (!currentProgress) return false;

    const updatedProgress = {
      ...currentProgress,
      ...updates,
      lastSaveTime: Date.now()
    };

    return this.saveProgress(updatedProgress);
  }
}

// 玩家设置管理
export class PlayerSettingsManager {
  // 默认设置
  private static defaultSettings: PlayerSettings = {
    defaultGameMode: 'timed',
    defaultQuestionCount: 5,
    defaultTimeLimit: 120,
    soundEnabled: true,
    mapExpanded: false,
    theme: 'auto',
    language: 'zh-CN',
    autoSave: true,
    showHints: true,
  };

  // 保存设置
  static saveSettings(settings: Partial<PlayerSettings>): boolean {
    const currentSettings = this.loadSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    return storageManager.setJSON(STORAGE_KEYS.PLAYER_SETTINGS, updatedSettings);
  }

  // 加载设置
  static loadSettings(): PlayerSettings {
    const settings = storageManager.getJSON<PlayerSettings>(
      STORAGE_KEYS.PLAYER_SETTINGS,
      this.defaultSettings
    );
    
    // 合并默认设置，确保所有字段都存在
    return { ...this.defaultSettings, ...settings };
  }

  // 重置为默认设置
  static resetSettings(): boolean {
    return storageManager.setJSON(STORAGE_KEYS.PLAYER_SETTINGS, this.defaultSettings);
  }

  // 获取单个设置
  static getSetting<K extends keyof PlayerSettings>(key: K): PlayerSettings[K] {
    const settings = this.loadSettings();
    return settings[key];
  }

  // 更新单个设置
  static updateSetting<K extends keyof PlayerSettings>(
    key: K,
    value: PlayerSettings[K]
  ): boolean {
    return this.saveSettings({ [key]: value } as Partial<PlayerSettings>);
  }
}

// 游戏历史管理
export class GameHistoryManager {
  // 添加游戏记录
  static addGame(game: GameHistory): boolean {
    const history = this.loadHistory();
    history.unshift(game); // 添加到开头
    
    // 限制历史记录数量（最多保存100条）
    const maxHistory = 100;
    if (history.length > maxHistory) {
      history.splice(maxHistory);
    }
    
    return storageManager.setJSON(STORAGE_KEYS.GAME_HISTORY, history);
  }

  // 加载游戏历史
  static loadHistory(): GameHistory[] {
    return storageManager.getJSON<GameHistory[]>(STORAGE_KEYS.GAME_HISTORY, []) || [];
  }

  // 清除历史记录
  static clearHistory(): boolean {
    return storageManager.setJSON(STORAGE_KEYS.GAME_HISTORY, []);
  }

  // 获取最近的游戏
  static getRecentGames(count: number = 10): GameHistory[] {
    const history = this.loadHistory();
    return history.slice(0, count);
  }

  // 按游戏模式筛选
  static getGamesByMode(gameMode: string): GameHistory[] {
    const history = this.loadHistory();
    return history.filter(game => game.gameMode === gameMode);
  }

  // 获取最高分游戏
  static getBestGames(count: number = 5): GameHistory[] {
    const history = this.loadHistory();
    return history
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, count);
  }
}

// 玩家统计管理
export class PlayerStatsManager {
  // 默认统计
  private static defaultStats: PlayerStats = {
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    gamesCompleted: 0,
    totalPlayTime: 0,
    lastPlayed: 0,
    streakCurrent: 0,
    streakBest: 0,
    favoriteGameMode: 'timed',
    achievements: [],
  };

  // 加载统计
  static loadStats(): PlayerStats {
    const stats = storageManager.getJSON<PlayerStats>(
      STORAGE_KEYS.PLAYER_STATS,
      this.defaultStats
    );
    
    return { ...this.defaultStats, ...stats };
  }

  // 保存统计
  static saveStats(stats: PlayerStats): boolean {
    return storageManager.setJSON(STORAGE_KEYS.PLAYER_STATS, stats);
  }

  // 更新游戏完成后的统计
  static updateAfterGame(gameResult: {
    totalScore: number;
    gameMode: string;
    duration: number;
    completed: boolean;
  }): boolean {
    const stats = this.loadStats();
    
    stats.totalGames++;
    stats.lastPlayed = Date.now();
    stats.totalPlayTime += gameResult.duration;
    
    if (gameResult.completed) {
      stats.gamesCompleted++;
      stats.totalScore += gameResult.totalScore;
      stats.averageScore = Math.round(stats.totalScore / stats.gamesCompleted);
      
      if (gameResult.totalScore > stats.bestScore) {
        stats.bestScore = gameResult.totalScore;
      }
      
      // 更新连胜
      stats.streakCurrent++;
      if (stats.streakCurrent > stats.streakBest) {
        stats.streakBest = stats.streakCurrent;
      }
    } else {
      // 游戏未完成，重置连胜
      stats.streakCurrent = 0;
    }
    
    // 更新最喜欢的游戏模式
    const history = GameHistoryManager.loadHistory();
    const modeCount = history.reduce((acc, game) => {
      acc[game.gameMode] = (acc[game.gameMode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteMode = Object.entries(modeCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (favoriteMode) {
      stats.favoriteGameMode = favoriteMode[0];
    }
    
    return this.saveStats(stats);
  }

  // 重置统计
  static resetStats(): boolean {
    return storageManager.setJSON(STORAGE_KEYS.PLAYER_STATS, this.defaultStats);
  }

  // 添加成就
  static addAchievement(achievement: string): boolean {
    const stats = this.loadStats();
    
    if (!stats.achievements.includes(achievement)) {
      stats.achievements.push(achievement);
      return this.saveStats(stats);
    }
    
    return true;
  }
}

// 导出存储管理器和工具函数
export { storageManager };

// 存储空间检查工具
export function checkStorageSpace(): {
  hasSpace: boolean;
  usage: number;
  warning: boolean;
} {
  const info = storageManager.getStorageInfo();
  const usagePercent = (info.used / info.total) * 100;
  
  return {
    hasSpace: info.available > 100 * 1024, // 至少100KB可用空间
    usage: usagePercent,
    warning: usagePercent > 80, // 使用超过80%时警告
  };
}

// 数据导出/导入功能
export function exportGameData(): string {
  const data = {
    settings: PlayerSettingsManager.loadSettings(),
    history: GameHistoryManager.loadHistory(),
    stats: PlayerStatsManager.loadStats(),
    exportTime: Date.now(),
    version: '1.0.0'
  };
  
  return JSON.stringify(data, null, 2);
}

export function importGameData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    
    // 验证数据格式
    if (!data.version || !data.exportTime) {
      throw new Error('Invalid data format');
    }
    
    // 导入数据
    if (data.settings) {
      PlayerSettingsManager.saveSettings(data.settings);
    }
    
    if (data.history && Array.isArray(data.history)) {
      storageManager.setJSON(STORAGE_KEYS.GAME_HISTORY, data.history);
    }
    
    if (data.stats) {
      PlayerStatsManager.saveStats(data.stats);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import game data:', error);
    return false;
  }
}