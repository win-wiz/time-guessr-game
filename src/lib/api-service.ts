// 统一的API服务层 - 管理所有API调用
import { getCachedResponse, setCachedResponse, deduplicateRequest } from './api-performance-optimization';

// 基础API配置
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// 统一的错误类型
export interface APIError {
  type: string;
  message: string;
  details?: string[];
  code?: number;
}

// 统一的响应格式
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
}

// HTTP客户端类
class APIClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: typeof API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
  }

  // 统一的请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false,
    cacheTTL: number = 300000
  ): Promise<APIResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
    const cacheKey = `${url}_${JSON.stringify(options.body || {})}`;

    // 检查缓存
    if (useCache) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // 请求去重
    return deduplicateRequest(cacheKey, async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result: APIResponse<T> = await response.json();

          // 缓存成功的响应
          if (useCache && result.success) {
            setCachedResponse(cacheKey, result, cacheTTL);
          }

          return result;
        } catch (error) {
          lastError = error as Error;
          
          // 如果不是最后一次尝试，等待后重试
          if (attempt < this.retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)));
          }
        }
      }

      // 所有重试都失败了
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: lastError?.message || 'Request failed after retries',
          code: 500
        }
      };
    });
  }

  // GET请求
  async get<T>(endpoint: string, useCache: boolean = false, cacheTTL?: number): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, useCache, cacheTTL);
  }

  // POST请求
  async post<T>(endpoint: string, data?: any, useCache: boolean = false): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, useCache);
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 创建全局API客户端实例
const apiClient = new APIClient(API_CONFIG);

// 游戏相关API接口类型定义
export interface StartGameRequest {
  gameMode: 'timed' | 'untimed';
  questionCount: number;
  timeLimit?: number;
}

export interface StartGameResponse {
  gameSessionId: string;
  eventIds: string[];
  currentQuestion: number;
  totalQuestions: number;
  gameMode: string;
  timeLimit?: number;
}

export interface SubmitAnswerRequest {
  gameSessionId: string;
  eventId: string;
  guessedYear: number;
  guessedLocation?: {
    lat: number;
    lng: number;
  };
  answerTime?: number;
}

export interface SubmitAnswerResponse {
  questionSessionId: string;
  gameSessionId: string;
  status: 'submitted' | 'completed';
}

export interface EventDetail {
  id: string;
  city: string;
  latitude: number;
  longitude: number;
  year: number;
  description?: string;
  imageUrl?: string;
  difficulty?: string;
}

export interface GameResult {
  gameSessionId: string;
  totalScore: number;
  averageScore: number;
  questionsCompleted: number;
  totalQuestions: number;
  gameMode: string;
  timeLimit?: number;
  isCompleted: boolean;
  completedAt?: string;
  questionSessions: Array<{
    questionSessionId: string;
    eventId: string;
    guessedYear: number;
    guessedLocation?: {
      lat: number;
      lng: number;
    };
    answerTime?: number;
    finalScore: number;
    rank: string;
  }>;
}

export interface QuestionResult {
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
  // 标准事件详细信息字段
  event?: {
    id: string;
    city: string;
    latitude: number;
    longitude: number;
    year: number;
    description?: string;
    imageUrl?: string;
    difficulty?: string;
  };
  // 兼容旧版本的字段（已弃用）
  eventDetail?: {
    id: string;
    city: string;
    latitude: number;
    longitude: number;
    year: number;
    description?: string;
    imageUrl?: string;
    difficulty?: string;
  };
}

// 游戏API服务类
export class GameAPIService {
  // 开始游戏
  static async startGame(request: StartGameRequest): Promise<StartGameResponse> {
    const response = await apiClient.post<StartGameResponse>('/game/start', request);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to start game');
    }
    
    return response.data!;
  }

  // 提交答案
  static async submitAnswer(request: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const response = await apiClient.post<SubmitAnswerResponse>('/game/submit', request);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to submit answer');
    }
    
    return response.data!;
  }

  // 获取事件详情（使用缓存）
  static async getEventDetail(eventId: string): Promise<EventDetail> { 
    const response = await apiClient.get<EventDetail>(`/events/${eventId}`, true, 600000); // 10分钟缓存
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get event detail');
    }
    
    return response.data!;
  }

  // 批量获取事件详情
  static async getEventDetails(eventIds: string[]): Promise<EventDetail[]> {
    const promises = eventIds.map(id => this.getEventDetail(id));
    return Promise.all(promises);
  }

  // 获取游戏结果（使用缓存）
  static async getGameResult(gameSessionId: string): Promise<GameResult> {
    const response = await apiClient.get<GameResult>(`/game/result/${gameSessionId}`, true, 3600000); // 1小时缓存
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get game result');
    }
    
    return response.data!;
  }

  // 获取单题详细结果（使用缓存）
  static async getQuestionResult(questionSessionId: string): Promise<QuestionResult> {
    const response = await apiClient.get<QuestionResult>(`/game/question-result/${questionSessionId}`, true, 3600000); // 1小时缓存
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get question result');
    }
    
    return response.data!;
  }
}

// 排行榜API服务
export interface LeaderboardEntry {
  playerId: string;
  playerName?: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  rank: number;
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
}

export class LeaderboardAPIService {
  // 获取排行榜（使用缓存）
  static async getLeaderboard(
    type: string = 'all_time',
    limit: number = 10,
    difficulty?: string
  ): Promise<LeaderboardResponse> {
    const params = new URLSearchParams({
      type,
      limit: limit.toString(),
      ...(difficulty && { difficulty })
    });
    
    const response = await apiClient.get<LeaderboardResponse>(
      `/game/leaderboard?${params}`,
      true,
      300000 // 5分钟缓存
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get leaderboard');
    }
    
    return response.data!;
  }
}

// 玩家统计API服务
export interface PlayerStats {
  playerId: string;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  skillLevel: string;
  playerRating: number;
  lastPlayed?: string;
}

// 游戏历史记录
export interface GameHistoryEntry {
  gameId: string;
  completedAt: string;
  totalScore: number;
  totalRounds: number;
  gameMode: string;
  timeLimit?: number;
  duration: number;
}

// 玩家设置
export interface PlayerSettings {
  playerId: string;
  defaultGameMode: 'timed' | 'untimed';
  defaultQuestionCount: number;
  defaultTimeLimit: number;
  notifications: boolean;
  privacy: 'public' | 'private';
}

export class PlayerAPIService {
  // 获取玩家统计（使用缓存）
  static async getPlayerStats(playerId: string): Promise<PlayerStats> {
    const response = await apiClient.get<PlayerStats>(
      `/player/stats/${playerId}`,
      true,
      3600000 // 1小时缓存
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get player stats');
    }
    
    return response.data!;
  }

  // 获取玩家游戏历史
  static async getPlayerHistory(playerId: string, limit: number = 20): Promise<GameHistoryEntry[]> {
    const response = await apiClient.get<GameHistoryEntry[]>(
      `/player/history/${playerId}?limit=${limit}`,
      true,
      1800000 // 30分钟缓存
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get player history');
    }
    
    return response.data!;
  }

  // 保存玩家设置
  static async savePlayerSettings(settings: PlayerSettings): Promise<void> {
    const response = await apiClient.post<void>('/player/settings', settings);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save player settings');
    }
  }

  // 获取玩家设置
  static async getPlayerSettings(playerId: string): Promise<PlayerSettings> {
    const response = await apiClient.get<PlayerSettings>(
      `/player/settings/${playerId}`,
      true,
      3600000 // 1小时缓存
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get player settings');
    }
    
    return response.data!;
  }
}

// 导出默认的API客户端
export default apiClient;