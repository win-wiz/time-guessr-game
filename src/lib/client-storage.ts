// 客户端存储服务 - 仅用于缓存和临时数据
import { EventDetail } from './api-service';

// 存储键名常量
const STORAGE_KEYS = {
  TEMP_PROGRESS: 'time_guessr_temp_progress', // 临时进度（仅用于页面刷新恢复）
  USER_PREFERENCES: 'time_guessr_user_preferences', // 用户界面偏好
  CACHE_PREFIX: 'time_guessr_cache_',
} as const;

// 临时游戏进度（仅用于页面刷新恢复）
export interface TempGameProgress {
  gameSessionId: string;
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  selectedYear: number;
  guessLocation: { lat: number; lng: number } | null;
  questionStartTime: number;
  lastSaveTime: number;
  // 新增：保存完整的游戏数据
  eventIds: string[];
  events: any[]; // EventDetail[]
  questionSessionIds: string[];
  gameStartTime: number;
  scores: any[]; // GameScore[]
}

// 用户界面偏好
export interface UserPreferences {
  soundEnabled: boolean;
  mapExpanded: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  showHints: boolean;
  autoSaveProgress: boolean; // 是否自动保存临时进度
}

// 本地存储工具类
class ClientStorageManager {
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

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

  // 清除所有临时数据
  clearTempData(): boolean {
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
}

// 创建全局实例
const clientStorage = new ClientStorageManager();

// 临时进度管理（仅用于页面刷新恢复）
export class TempProgressManager {
  // 保存临时进度
  static saveTempProgress(progress: TempGameProgress): boolean {
    const progressWithTimestamp = {
      ...progress,
      lastSaveTime: Date.now()
    };
    
    return clientStorage.setJSON(STORAGE_KEYS.TEMP_PROGRESS, progressWithTimestamp);
  }

  // 加载临时进度
  static loadTempProgress(): TempGameProgress | null {
    const progress = clientStorage.getJSON<TempGameProgress>(STORAGE_KEYS.TEMP_PROGRESS);
    
    // 检查进度是否过期（1小时）
    if (progress && progress.lastSaveTime) {
      const now = Date.now();
      const maxAge = 60 * 60 * 1000; // 1小时
      
      if (now - progress.lastSaveTime > maxAge) {
        this.clearTempProgress();
        return null;
      }
    }
    
    return progress;
  }

  // 清除临时进度
  static clearTempProgress(): boolean {
    return clientStorage.remove(STORAGE_KEYS.TEMP_PROGRESS);
  }

  // 检查是否有临时进度
  static hasTempProgress(): boolean {
    return this.loadTempProgress() !== null;
  }
}

// 用户偏好管理
export class UserPreferencesManager {
  // 默认偏好
  private static defaultPreferences: UserPreferences = {
    soundEnabled: true,
    mapExpanded: false,
    theme: 'auto',
    language: 'zh-CN',
    showHints: true,
    autoSaveProgress: true,
  };

  // 保存偏好
  static savePreferences(preferences: Partial<UserPreferences>): boolean {
    const currentPreferences = this.loadPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    
    return clientStorage.setJSON(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
  }

  // 加载偏好
  static loadPreferences(): UserPreferences {
    const preferences = clientStorage.getJSON<UserPreferences>(
      STORAGE_KEYS.USER_PREFERENCES,
      this.defaultPreferences
    );
    
    // 合并默认偏好，确保所有字段都存在
    return { ...this.defaultPreferences, ...preferences };
  }

  // 重置为默认偏好
  static resetPreferences(): boolean {
    return clientStorage.setJSON(STORAGE_KEYS.USER_PREFERENCES, this.defaultPreferences);
  }

  // 获取单个偏好
  static getPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    const preferences = this.loadPreferences();
    return preferences[key];
  }

  // 更新单个偏好
  static updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): boolean {
    return this.savePreferences({ [key]: value } as Partial<UserPreferences>);
  }
}

// 缓存管理
export class CacheManager {
  // 设置缓存
  static setCache<T>(key: string, data: T, ttl: number = 300000): boolean {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    return clientStorage.setJSON(`${STORAGE_KEYS.CACHE_PREFIX}${key}`, cacheData);
  }

  // 获取缓存
  static getCache<T>(key: string): T | null {
    const cacheData = clientStorage.getJSON<{
      data: T;
      timestamp: number;
      ttl: number;
    }>(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);

    if (!cacheData) return null;

    // 检查是否过期
    const now = Date.now();
    if (now - cacheData.timestamp > cacheData.ttl) {
      this.removeCache(key);
      return null;
    }

    return cacheData.data;
  }

  // 删除缓存
  static removeCache(key: string): boolean {
    return clientStorage.remove(`${STORAGE_KEYS.CACHE_PREFIX}${key}`);
  }

  // 清除所有缓存
  static clearAllCache(): boolean {
    if (!clientStorage['isClient']) return false;

    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEYS.CACHE_PREFIX)) {
          clientStorage.remove(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }
}

// 导出存储管理器
export { clientStorage };

// 存储空间检查工具
export function checkClientStorageSpace(): {
  hasSpace: boolean;
  usage: number;
  warning: boolean;
} {
  if (!clientStorage['isClient']) {
    return { hasSpace: true, usage: 0, warning: false };
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
    const usagePercent = (used / total) * 100;

    return {
      hasSpace: available > 100 * 1024, // 至少100KB可用空间
      usage: usagePercent,
      warning: usagePercent > 80, // 使用超过80%时警告
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { hasSpace: true, usage: 0, warning: false };
  }
}