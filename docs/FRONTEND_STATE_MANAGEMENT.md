# Time Guessr Game - 前端状态管理与本地存储实现指南

本文档详细说明了 Time Guessr 游戏前端的状态管理和本地存储实现方案，确保游戏的连续性和良好的用户体验。

## 概述

### 为什么需要本地存储

1. **游戏会话连续性**: 防止用户刷新页面或意外关闭标签页导致游戏进度丢失
2. **网络中断恢复**: 临时网络问题不会导致游戏重新开始
3. **性能优化**: 减少重复的API调用，提升用户体验
4. **离线支持**: 题目信息可以预加载并缓存

### 存储内容

从 `POST /game/start` 接口返回的关键数据：
- `gameSessionId`: 整个游戏的唯一标识
- `eventIds`: 题目序列，决定游戏流程
- `currentQuestion`: 当前题目位置
- `totalQuestions`: 总题目数
- `gameMode`: 游戏模式
- `timeLimit`: 时间限制（如果有）

## 数据结构设计

### 1. 游戏状态接口定义

```typescript
// 存储在 localStorage 中的游戏状态
interface StoredGameData {
  // 基础游戏信息
  gameSessionId: string;
  eventIds: string[];
  gameMode: 'timed' | 'untimed';
  timeLimit?: number;
  totalQuestions: number;
  
  // 进度追踪
  currentQuestionIndex: number;
  completedQuestions: string[];  // 已完成的 questionSessionId 列表
  
  // 时间信息
  startTime: number;           // 游戏开始时间戳
  lastActiveTime: number;      // 最后活跃时间戳
  totalElapsedTime: number;    // 总耗时（毫秒）
  
  // 缓存的题目数据（可选）
  cachedEvents?: EventDetail[];
  
  // 游戏配置
  settings?: {
    soundEnabled: boolean;
    autoAdvance: boolean;
    showHints: boolean;
  };
}

// 事件详情接口
interface EventDetail {
  id: string;
  city: string;
  latitude: number;
  longitude: number;
  year: number;
  description?: string;
  imageUrl?: string;
  difficulty?: string;
}

// 游戏历史记录
interface GameHistoryEntry {
  gameSessionId: string;
  completedAt: number;
  totalScore: number;
  questionsCompleted: number;
  gameMode: string;
}
```

### 2. 存储键名常量

```typescript
const STORAGE_KEYS = {
  CURRENT_GAME: 'timeguessr_current_game',
  GAME_HISTORY: 'timeguessr_game_history',
  USER_SETTINGS: 'timeguessr_user_settings',
  CACHED_EVENTS: 'timeguessr_cached_events'
} as const;
```

## 核心实现

### 1. 游戏状态管理器

```typescript
class GameStateManager {
  private static readonly STORAGE_KEY = STORAGE_KEYS.CURRENT_GAME;
  private static readonly EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2小时过期
  
  /**
   * 保存游戏状态到本地存储
   */
  static saveGameState(gameData: StoredGameData): void {
    try {
      gameData.lastActiveTime = Date.now();
      const serialized = JSON.stringify(gameData);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      
      console.log('Game state saved:', gameData.gameSessionId);
    } catch (error) {
      console.error('Failed to save game state:', error);
      // 降级处理：使用 sessionStorage
      this.fallbackSave(gameData);
    }
  }
  
  /**
   * 从本地存储加载游戏状态
   */
  static loadGameState(): StoredGameData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.fallbackLoad();
      }
      
      const gameData: StoredGameData = JSON.parse(stored);
      
      // 检查是否过期
      if (this.isExpired(gameData)) {
        console.log('Game state expired, clearing...');
        this.clearGameState();
        return null;
      }
      
      console.log('Game state loaded:', gameData.gameSessionId);
      return gameData;
    } catch (error) {
      console.error('Failed to load game state:', error);
      this.clearGameState();
      return null;
    }
  }
  
  /**
   * 更新游戏进度
   */
  static updateProgress(questionIndex: number, questionSessionId?: string): void {
    const gameData = this.loadGameState();
    if (!gameData) return;
    
    gameData.currentQuestionIndex = questionIndex;
    
    if (questionSessionId) {
      gameData.completedQuestions.push(questionSessionId);
    }
    
    this.saveGameState(gameData);
  }
  
  /**
   * 更新总耗时
   */
  static updateElapsedTime(): void {
    const gameData = this.loadGameState();
    if (!gameData) return;
    
    const currentTime = Date.now();
    const sessionTime = currentTime - gameData.lastActiveTime;
    gameData.totalElapsedTime += sessionTime;
    
    this.saveGameState(gameData);
  }
  
  /**
   * 清除当前游戏状态
   */
  static clearGameState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
    console.log('Game state cleared');
  }
  
  /**
   * 检查游戏状态是否过期
   */
  private static isExpired(gameData: StoredGameData): boolean {
    const timeSinceLastActive = Date.now() - gameData.lastActiveTime;
    return timeSinceLastActive > this.EXPIRY_TIME;
  }
  
  /**
   * 降级保存到 sessionStorage
   */
  private static fallbackSave(gameData: StoredGameData): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(gameData));
    } catch (error) {
      console.error('Fallback save also failed:', error);
    }
  }
  
  /**
   * 从 sessionStorage 降级加载
   */
  private static fallbackLoad(): StoredGameData | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Fallback load failed:', error);
      return null;
    }
  }
}
```

### 2. 游戏历史管理器

```typescript
class GameHistoryManager {
  private static readonly STORAGE_KEY = STORAGE_KEYS.GAME_HISTORY;
  private static readonly MAX_HISTORY_ENTRIES = 20;
  
  /**
   * 添加游戏记录到历史
   */
  static addToHistory(gameResult: GameHistoryEntry): void {
    try {
      const history = this.getHistory();
      history.unshift(gameResult); // 最新的在前面
      
      // 限制历史记录数量
      const trimmedHistory = history.slice(0, this.MAX_HISTORY_ENTRIES);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory));
      console.log('Game added to history:', gameResult.gameSessionId);
    } catch (error) {
      console.error('Failed to save game history:', error);
    }
  }
  
  /**
   * 获取游戏历史记录
   */
  static getHistory(): GameHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load game history:', error);
      return [];
    }
  }
  
  /**
   * 清除游戏历史
   */
  static clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Game history cleared');
  }
  
  /**
   * 获取统计信息
   */
  static getStats(): {
    totalGames: number;
    averageScore: number;
    bestScore: number;
    totalQuestionsCompleted: number;
  } {
    const history = this.getHistory();
    
    if (history.length === 0) {
      return {
        totalGames: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestionsCompleted: 0
      };
    }
    
    const totalScore = history.reduce((sum, game) => sum + game.totalScore, 0);
    const totalQuestions = history.reduce((sum, game) => sum + game.questionsCompleted, 0);
    const bestScore = Math.max(...history.map(game => game.totalScore));
    
    return {
      totalGames: history.length,
      averageScore: Math.round(totalScore / history.length),
      bestScore,
      totalQuestionsCompleted: totalQuestions
    };
  }
}
```

### 3. 事件缓存管理器

```typescript
class EventCacheManager {
  private static readonly STORAGE_KEY = STORAGE_KEYS.CACHED_EVENTS;
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时
  
  /**
   * 缓存事件数据
   */
  static cacheEvents(events: EventDetail[]): void {
    try {
      const cacheData = {
        events,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
      console.log(`Cached ${events.length} events`);
    } catch (error) {
      console.error('Failed to cache events:', error);
    }
  }
  
  /**
   * 获取缓存的事件数据
   */
  static getCachedEvents(eventIds: string[]): EventDetail[] | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const cacheData = JSON.parse(stored);
      
      // 检查缓存是否过期
      if (Date.now() - cacheData.timestamp > this.CACHE_EXPIRY) {
        this.clearCache();
        return null;
      }
      
      // 检查是否包含所需的所有事件
      const cachedEvents: EventDetail[] = cacheData.events;
      const cachedEventIds = new Set(cachedEvents.map(e => e.id));
      
      const hasAllEvents = eventIds.every(id => cachedEventIds.has(id));
      if (!hasAllEvents) return null;
      
      // 返回按顺序排列的事件
      return eventIds.map(id => 
        cachedEvents.find(event => event.id === id)!
      );
    } catch (error) {
      console.error('Failed to load cached events:', error);
      return null;
    }
  }
  
  /**
   * 清除事件缓存
   */
  static clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Event cache cleared');
  }
}
```

## 游戏流程集成

### 1. 游戏开始时的处理

```typescript
// 游戏开始函数
async function startNewGame(gameConfig: {
  gameMode: 'timed' | 'untimed';
  questionCount: number;
  timeLimit?: number;
}): Promise<void> {
  try {
    // 1. 检查是否有未完成的游戏
    const existingGame = GameStateManager.loadGameState();
    if (existingGame) {
      const shouldContinue = await confirmContinueGame(existingGame);
      if (shouldContinue) {
        await resumeGame(existingGame);
        return;
      } else {
        GameStateManager.clearGameState();
      }
    }
    
    // 2. 调用开始游戏API
    const response = await fetch('/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameConfig)
    });
    
    const gameData = await response.json();
    
    if (!gameData.success) {
      throw new Error(gameData.error?.message || 'Failed to start game');
    }
    
    // 3. 保存游戏状态
    const storedGameData: StoredGameData = {
      gameSessionId: gameData.data.gameSessionId,
      eventIds: gameData.data.eventIds,
      gameMode: gameData.data.gameMode,
      timeLimit: gameData.data.timeLimit,
      totalQuestions: gameData.data.totalQuestions,
      currentQuestionIndex: 0,
      completedQuestions: [],
      startTime: Date.now(),
      lastActiveTime: Date.now(),
      totalElapsedTime: 0
    };
    
    GameStateManager.saveGameState(storedGameData);
    
    // 4. 预加载事件数据
    await preloadEvents(gameData.data.eventIds);
    
    // 5. 开始游戏
    await startGameplay(storedGameData);
    
  } catch (error) {
    console.error('Failed to start game:', error);
    showErrorMessage('游戏启动失败，请重试');
  }
}

// 确认是否继续游戏的对话框
async function confirmContinueGame(gameData: StoredGameData): Promise<boolean> {
  const progress = `${gameData.completedQuestions.length}/${gameData.totalQuestions}`;
  const timeElapsed = formatTime(gameData.totalElapsedTime);
  
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>检测到未完成的游戏</h3>
          <p>进度: ${progress} 题</p>
          <p>已用时间: ${timeElapsed}</p>
          <p>是否继续之前的游戏？</p>
          <div class="modal-buttons">
            <button id="continue-btn">继续游戏</button>
            <button id="new-game-btn">开始新游戏</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#continue-btn')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(true);
    });
    
    modal.querySelector('#new-game-btn')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(false);
    });
  });
}
```

### 2. 游戏进行中的状态更新

```typescript
// 提交答案时的处理
async function submitAnswer(answerData: {
  eventId: string;
  guessedYear: number;
  guessedLocation?: { lat: number; lng: number };
  answerTime?: number;
}): Promise<void> {
  try {
    const gameData = GameStateManager.loadGameState();
    if (!gameData) {
      throw new Error('No active game session');
    }
    
    // 更新耗时
    GameStateManager.updateElapsedTime();
    
    // 提交答案
    const response = await fetch('/game/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        gameSessionId: gameData.gameSessionId,
        ...answerData
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to submit answer');
    }
    
    // 更新进度
    const nextQuestionIndex = gameData.currentQuestionIndex + 1;
    GameStateManager.updateProgress(
      nextQuestionIndex,
      result.data.questionSessionId
    );
    
    // 显示单题结果
    await showQuestionResult(result.data.questionSessionId);
    
    // 检查游戏是否完成
    if (result.data.status === 'completed') {
      await handleGameCompletion(gameData.gameSessionId);
    } else {
      // 继续下一题
      await loadNextQuestion(nextQuestionIndex);
    }
    
  } catch (error) {
    console.error('Failed to submit answer:', error);
    showErrorMessage('提交答案失败，请重试');
  }
}
```

### 3. 游戏完成时的处理

```typescript
// 游戏完成处理
async function handleGameCompletion(gameSessionId: string): Promise<void> {
  try {
    // 获取最终结果
    const gameResult = await fetch(`/game/result/${gameSessionId}`);
    const resultData = await gameResult.json();
    
    if (resultData.success) {
      // 添加到历史记录
      const historyEntry: GameHistoryEntry = {
        gameSessionId,
        completedAt: Date.now(),
        totalScore: resultData.data.totalScore,
        questionsCompleted: resultData.data.questionsCompleted,
        gameMode: resultData.data.gameMode
      };
      
      GameHistoryManager.addToHistory(historyEntry);
    }
    
    // 清除当前游戏状态
    GameStateManager.clearGameState();
    
    // 显示最终结果页面
    await showFinalResults(resultData);
    
  } catch (error) {
    console.error('Failed to handle game completion:', error);
  }
}
```

### 4. 页面加载时的恢复逻辑

```typescript
// 应用初始化
function initializeApp(): void {
  // 检查是否有未完成的游戏
  const savedGame = GameStateManager.loadGameState();
  
  if (savedGame) {
    console.log('Found saved game:', savedGame.gameSessionId);
    
    // 显示恢复游戏的选项
    showGameRecoveryOption(savedGame);
  } else {
    // 显示主菜单
    showMainMenu();
  }
  
  // 设置页面可见性变化监听
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 设置页面卸载前的保存
  window.addEventListener('beforeunload', handleBeforeUnload);
}

// 页面可见性变化处理
function handleVisibilityChange(): void {
  if (document.hidden) {
    // 页面隐藏时更新最后活跃时间
    GameStateManager.updateElapsedTime();
  } else {
    // 页面显示时检查游戏状态
    const gameData = GameStateManager.loadGameState();
    if (gameData) {
      gameData.lastActiveTime = Date.now();
      GameStateManager.saveGameState(gameData);
    }
  }
}

// 页面卸载前处理
function handleBeforeUnload(): void {
  GameStateManager.updateElapsedTime();
}
```

## 错误处理和降级策略

### 1. 存储空间不足处理

```typescript
class StorageManager {
  /**
   * 检查存储空间
   */
  static checkStorageSpace(): { available: boolean; usage: number } {
    try {
      const testKey = 'storage_test';
      const testData = 'x'.repeat(1024); // 1KB test data
      
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      
      // 估算使用量
      let usage = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          usage += localStorage[key].length;
        }
      }
      
      return { available: true, usage };
    } catch (error) {
      return { available: false, usage: -1 };
    }
  }
  
  /**
   * 清理旧数据释放空间
   */
  static cleanupOldData(): void {
    try {
      // 清理过期的缓存
      EventCacheManager.clearCache();
      
      // 清理旧的游戏历史（只保留最近10条）
      const history = GameHistoryManager.getHistory();
      if (history.length > 10) {
        const recentHistory = history.slice(0, 10);
        localStorage.setItem(
          STORAGE_KEYS.GAME_HISTORY,
          JSON.stringify(recentHistory)
        );
      }
      
      console.log('Old data cleaned up');
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }
}
```

### 2. 隐私模式和存储限制处理

```typescript
class PrivacyModeHandler {
  /**
   * 检测是否为隐私模式
   */
  static isPrivateMode(): boolean {
    try {
      localStorage.setItem('privacy_test', 'test');
      localStorage.removeItem('privacy_test');
      return false;
    } catch (error) {
      return true;
    }
  }
  
  /**
   * 隐私模式下的降级存储
   */
  static createMemoryStorage(): Storage {
    const memoryStorage: { [key: string]: string } = {};
    
    return {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete memoryStorage[key];
      },
      clear: () => {
        Object.keys(memoryStorage).forEach(key => {
          delete memoryStorage[key];
        });
      },
      get length() {
        return Object.keys(memoryStorage).length;
      },
      key: (index: number) => {
        const keys = Object.keys(memoryStorage);
        return keys[index] || null;
      }
    };
  }
}
```

## 工具函数

### 1. 时间格式化

```typescript
function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
```

### 2. 数据验证

```typescript
function validateGameData(data: any): data is StoredGameData {
  return (
    typeof data === 'object' &&
    typeof data.gameSessionId === 'string' &&
    Array.isArray(data.eventIds) &&
    typeof data.gameMode === 'string' &&
    typeof data.totalQuestions === 'number' &&
    typeof data.currentQuestionIndex === 'number' &&
    Array.isArray(data.completedQuestions) &&
    typeof data.startTime === 'number' &&
    typeof data.lastActiveTime === 'number'
  );
}
```

## 最佳实践

### 1. 性能优化

- **批量操作**: 避免频繁的 localStorage 读写
- **数据压缩**: 对大量数据进行压缩存储
- **异步处理**: 使用 Web Workers 处理大量数据
- **内存缓存**: 在内存中缓存常用数据

### 2. 安全考虑

- **数据验证**: 从 localStorage 读取的数据必须验证
- **敏感信息**: 不在本地存储敏感信息（如认证令牌）
- **XSS 防护**: 防止恶意脚本访问存储数据

### 3. 用户体验

- **加载指示**: 显示数据加载状态
- **错误提示**: 友好的错误信息
- **优雅降级**: 存储不可用时的备选方案
- **数据同步**: 与服务器数据保持同步

## 测试策略

### 1. 单元测试

```typescript
// 测试游戏状态管理
describe('GameStateManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should save and load game state', () => {
    const gameData: StoredGameData = {
      gameSessionId: 'test-123',
      eventIds: ['event1', 'event2'],
      gameMode: 'timed',
      totalQuestions: 2,
      currentQuestionIndex: 0,
      completedQuestions: [],
      startTime: Date.now(),
      lastActiveTime: Date.now(),
      totalElapsedTime: 0
    };
    
    GameStateManager.saveGameState(gameData);
    const loaded = GameStateManager.loadGameState();
    
    expect(loaded).toEqual(expect.objectContaining({
      gameSessionId: 'test-123',
      eventIds: ['event1', 'event2']
    }));
  });
  
  it('should handle expired game state', () => {
    const expiredGameData: StoredGameData = {
      gameSessionId: 'expired-123',
      eventIds: ['event1'],
      gameMode: 'untimed',
      totalQuestions: 1,
      currentQuestionIndex: 0,
      completedQuestions: [],
      startTime: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
      lastActiveTime: Date.now() - 3 * 60 * 60 * 1000,
      totalElapsedTime: 0
    };
    
    localStorage.setItem('timeguessr_current_game', JSON.stringify(expiredGameData));
    
    const loaded = GameStateManager.loadGameState();
    expect(loaded).toBeNull();
  });
});
```

### 2. 集成测试

```typescript
// 测试完整的游戏流程
describe('Game Flow Integration', () => {
  it('should handle complete game lifecycle', async () => {
    // 开始游戏
    await startNewGame({
      gameMode: 'timed',
      questionCount: 3,
      timeLimit: 120
    });
    
    // 验证状态保存
    const gameData = GameStateManager.loadGameState();
    expect(gameData).toBeTruthy();
    expect(gameData!.totalQuestions).toBe(3);
    
    // 模拟答题
    for (let i = 0; i < 3; i++) {
      await submitAnswer({
        eventId: gameData!.eventIds[i],
        guessedYear: 2000 + i,
        answerTime: 30
      });
    }
    
    // 验证游戏完成后状态清理
    const finalGameData = GameStateManager.loadGameState();
    expect(finalGameData).toBeNull();
    
    // 验证历史记录
    const history = GameHistoryManager.getHistory();
    expect(history.length).toBe(1);
  });
});
```

## 总结

本文档提供了完整的前端状态管理和本地存储实现方案，包括：

1. **数据结构设计**: 清晰的接口定义和存储结构
2. **核心功能实现**: 状态管理、历史记录、缓存管理
3. **游戏流程集成**: 完整的游戏生命周期处理
4. **错误处理**: 降级策略和异常处理
5. **性能优化**: 最佳实践和优化建议
6. **测试策略**: 单元测试和集成测试

通过实施这套方案，可以确保 Time Guessr 游戏具有良好的用户体验、数据持久性和错误恢复能力。