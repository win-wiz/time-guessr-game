// API服务使用示例 - 展示如何在项目中使用统一的API服务

import { 
  GameAPIService, 
  LeaderboardAPIService, 
  PlayerAPIService,
  StartGameRequest,
  SubmitAnswerRequest 
} from './api-service';

// 1. 游戏流程完整示例
export class GameFlowExample {
  private gameSessionId: string = '';
  private eventIds: string[] = [];
  private questionSessionIds: string[] = [];

  // 开始游戏的完整流程
  async startGameFlow(): Promise<void> {
    try {
      // 1. 开始游戏
      const gameResponse = await GameAPIService.startGame({
        gameMode: 'timed',
        questionCount: 5,
        timeLimit: 120
      });

      this.gameSessionId = gameResponse.gameSessionId;
      this.eventIds = gameResponse.eventIds;

      console.log('游戏开始成功:', {
        gameSessionId: this.gameSessionId,
        totalQuestions: gameResponse.totalQuestions,
        eventIds: this.eventIds
      });

      // 2. 批量获取题目信息（自动使用缓存）
      const events = await GameAPIService.getEventDetails(this.eventIds);
      console.log('题目信息获取成功:', events);

      // 3. 开始答题流程
      await this.playGameRounds(events);

    } catch (error) {
      console.error('游戏流程错误:', error);
      throw error;
    }
  }

  // 游戏答题流程
  private async playGameRounds(events: any[]): Promise<void> {
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      
      try {
        // 模拟用户答题
        const userAnswer = await this.simulateUserAnswer(event);
        
        // 提交答案
        const submitResponse = await GameAPIService.submitAnswer({
          gameSessionId: this.gameSessionId,
          eventId: event.id,
          guessedYear: userAnswer.year,
          guessedLocation: userAnswer.location,
          answerTime: userAnswer.answerTime
        });

        this.questionSessionIds.push(submitResponse.questionSessionId);

        console.log(`第${i + 1}题提交成功:`, {
          questionSessionId: submitResponse.questionSessionId,
          status: submitResponse.status
        });

        // 如果游戏完成
        if (submitResponse.status === 'completed') {
          await this.handleGameCompletion();
          break;
        }

      } catch (error) {
        console.error(`第${i + 1}题提交失败:`, error);
      }
    }
  }

  // 模拟用户答题
  private async simulateUserAnswer(event: any): Promise<{
    year: number;
    location: { lat: number; lng: number };
    answerTime: number;
  }> {
    // 模拟用户思考时间
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
    
    return {
      year: event.year + Math.floor(Math.random() * 10 - 5), // 随机偏差
      location: {
        lat: event.latitude + (Math.random() - 0.5) * 0.1,
        lng: event.longitude + (Math.random() - 0.5) * 0.1
      },
      answerTime: Math.floor(Math.random() * 60 + 30) // 30-90秒
    };
  }

  // 处理游戏完成
  private async handleGameCompletion(): Promise<void> {
    try {
      // 获取游戏总结果
      const gameResult = await GameAPIService.getGameResult(this.gameSessionId);
      console.log('游戏总结果:', gameResult);

      // 获取最后一题的详细结果
      const lastQuestionId = this.questionSessionIds[this.questionSessionIds.length - 1];
      const lastQuestionResult = await GameAPIService.getQuestionResult(lastQuestionId);
      console.log('最后一题详细结果:', lastQuestionResult);

      // 可以获取所有题目的详细结果
      const allQuestionResults = await Promise.all(
        this.questionSessionIds.map(id => GameAPIService.getQuestionResult(id))
      );
      console.log('所有题目详细结果:', allQuestionResults);

    } catch (error) {
      console.error('获取游戏结果失败:', error);
    }
  }
}

// 2. 排行榜使用示例
export class LeaderboardExample {
  // 获取不同类型的排行榜
  async loadLeaderboards(): Promise<void> {
    try {
      // 全时排行榜
      const allTimeLeaderboard = await LeaderboardAPIService.getLeaderboard('all_time', 10);
      console.log('全时排行榜:', allTimeLeaderboard);

      // 周排行榜
      const weeklyLeaderboard = await LeaderboardAPIService.getLeaderboard('weekly', 20);
      console.log('周排行榜:', weeklyLeaderboard);

      // 困难模式排行榜
      const hardLeaderboard = await LeaderboardAPIService.getLeaderboard('all_time', 10, 'hard');
      console.log('困难模式排行榜:', hardLeaderboard);

    } catch (error) {
      console.error('获取排行榜失败:', error);
    }
  }
}

// 3. 玩家统计使用示例
export class PlayerStatsExample {
  // 获取玩家统计信息
  async loadPlayerStats(playerId: string): Promise<void> {
    try {
      const stats = await PlayerAPIService.getPlayerStats(playerId);
      
      console.log('玩家统计:', {
        totalGames: stats.totalGames,
        averageScore: stats.averageScore,
        bestScore: stats.bestScore,
        currentStreak: stats.currentStreak,
        skillLevel: stats.skillLevel,
        achievements: stats.achievements
      });

      // 可以基于统计数据做一些逻辑处理
      if (stats.currentStreak >= 5) {
        console.log('玩家当前连胜超过5局！');
      }

      if (stats.skillLevel === 'Expert') {
        console.log('玩家已达到专家级别！');
      }

    } catch (error) {
      console.error('获取玩家统计失败:', error);
    }
  }
}

// 4. 错误处理示例
export class ErrorHandlingExample {
  // 展示如何处理API错误
  async handleAPIErrors(): Promise<void> {
    try {
      // 尝试开始游戏
      const gameResponse = await GameAPIService.startGame({
        gameMode: 'timed',
        questionCount: 5,
        timeLimit: 120
      });
      
      console.log('游戏开始成功');
      
    } catch (error) {
      // 统一的错误处理
      if (error instanceof Error) {
        console.error('API调用失败:', error.message);
        
        // 根据错误类型进行不同处理
        if (error.message.includes('VALIDATION_ERROR')) {
          console.log('参数验证失败，请检查输入参数');
        } else if (error.message.includes('NETWORK_ERROR')) {
          console.log('网络错误，请检查网络连接');
        } else if (error.message.includes('DATABASE_ERROR')) {
          console.log('服务器错误，请稍后重试');
        }
      }
    }
  }

  // 带重试机制的API调用
  async apiCallWithRetry<T>(
    apiCall: () => Promise<T>, 
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          console.log(`API调用失败，第${attempt + 1}次重试...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  }
}

// 5. 性能优化使用示例
export class PerformanceOptimizationExample {
  // 展示如何利用缓存优化性能
  async demonstrateCaching(): Promise<void> {
    console.log('=== 缓存性能测试 ===');
    
    const eventId = '1';
    
    // 第一次调用 - 会从API获取数据
    console.time('首次API调用');
    const event1 = await GameAPIService.getEventDetail(eventId);
    console.timeEnd('首次API调用');
    
    // 第二次调用 - 会从缓存获取数据
    console.time('缓存调用');
    const event2 = await GameAPIService.getEventDetail(eventId);
    console.timeEnd('缓存调用');
    
    console.log('数据一致性检查:', event1.id === event2.id);
  }

  // 批量请求优化示例
  async demonstrateBatchRequests(): Promise<void> {
    console.log('=== 批量请求优化测试 ===');
    
    const eventIds = ['1', '2', '3', '4', '5'];
    
    // 使用批量API（推荐）
    console.time('批量请求');
    const eventsFromBatch = await GameAPIService.getEventDetails(eventIds);
    console.timeEnd('批量请求');
    
    // 单独请求对比
    console.time('单独请求');
    const eventsFromSingle = await Promise.all(
      eventIds.map(id => GameAPIService.getEventDetail(id))
    );
    console.timeEnd('单独请求');
    
    console.log('结果数量对比:', {
      batch: eventsFromBatch.length,
      single: eventsFromSingle.length
    });
  }
}

// 6. 完整的React Hook使用示例
export function useGameAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = async (request: StartGameRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await GameAPIService.startGame(request);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (request: SubmitAnswerRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await GameAPIService.submitAnswer(request);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    startGame,
    submitAnswer,
    loading,
    error,
    clearError: () => setError(null)
  };
}

// 导出所有示例
export {
  GameFlowExample,
  LeaderboardExample,
  PlayerStatsExample,
  ErrorHandlingExample,
  PerformanceOptimizationExample
};