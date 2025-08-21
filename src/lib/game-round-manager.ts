// 游戏轮次管理器 - 解决currentRound同步问题
export interface GameRoundInfo {
  gameSessionId: string;
  currentRound: number;
  totalRounds: number;
  eventIds: string[];
  lastUpdated: number;
}

export interface GameResumeInfo {
  gameSessionId: string;
  nextRound: number;
  totalRounds: number;
  timestamp: number;
}

export class GameRoundManager {
  private static readonly STORAGE_KEY = 'game_round_info';
  private static readonly RESUME_KEY = 'game_resume_info';

  // 保存当前轮次信息
  static saveRoundInfo(info: GameRoundInfo): void {
    try {
      const data = {
        ...info,
        lastUpdated: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log(`Round info saved: Round ${info.currentRound}/${info.totalRounds}`);
    } catch (error) {
      console.warn('Failed to save round info:', error);
    }
  }

  // 加载轮次信息
  static loadRoundInfo(): GameRoundInfo | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      
      const info = JSON.parse(data) as GameRoundInfo;
      
      // 检查数据是否过期（24小时）
      const now = Date.now();
      if (now - info.lastUpdated > 24 * 60 * 60 * 1000) {
        this.clearRoundInfo();
        return null;
      }
      
      return info;
    } catch (error) {
      console.warn('Failed to load round info:', error);
      return null;
    }
  }

  // 清除轮次信息
  static clearRoundInfo(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Round info cleared');
    } catch (error) {
      console.warn('Failed to clear round info:', error);
    }
  }

  // 保存恢复信息（从结果页面返回时使用）
  static saveResumeInfo(info: GameResumeInfo): void {
    try {
      localStorage.setItem(this.RESUME_KEY, JSON.stringify(info));
      console.log(`Resume info saved: Next round ${info.nextRound}/${info.totalRounds}`);
    } catch (error) {
      console.warn('Failed to save resume info:', error);
    }
  }

  // 加载并清除恢复信息
  static loadAndClearResumeInfo(): GameResumeInfo | null {
    try {
      const data = localStorage.getItem(this.RESUME_KEY);
      if (!data) return null;
      
      // 立即清除，避免重复使用
      localStorage.removeItem(this.RESUME_KEY);
      
      const info = JSON.parse(data) as GameResumeInfo;
      
      // 检查数据是否过期（1小时）
      const now = Date.now();
      if (now - info.timestamp > 60 * 60 * 1000) {
        return null;
      }
      
      return info;
    } catch (error) {
      console.warn('Failed to load resume info:', error);
      return null;
    }
  }

  // 更新当前轮次
  static updateCurrentRound(gameSessionId: string, newRound: number): boolean {
    const info = this.loadRoundInfo();
    if (!info || info.gameSessionId !== gameSessionId) {
      console.warn('Cannot update round: no matching game session');
      return false;
    }

    info.currentRound = newRound;
    this.saveRoundInfo(info);
    return true;
  }

  // 检查是否可以继续到下一轮
  static canAdvanceToNextRound(gameSessionId: string): boolean {
    const info = this.loadRoundInfo();
    if (!info || info.gameSessionId !== gameSessionId) {
      return false;
    }

    return info.currentRound < info.totalRounds;
  }

  // 获取下一轮轮次
  static getNextRound(gameSessionId: string): number | null {
    const info = this.loadRoundInfo();
    if (!info || info.gameSessionId !== gameSessionId) {
      return null;
    }

    const nextRound = info.currentRound + 1;
    return nextRound <= info.totalRounds ? nextRound : null;
  }

  // 从questionResult同步轮次信息
  static syncFromQuestionResult(questionResult: any): void {
    if (!questionResult || !questionResult.gameSessionId) {
      return;
    }

    const info = this.loadRoundInfo();
    if (info && info.gameSessionId === questionResult.gameSessionId) {
      // 使用questionNumber作为准确的轮次信息
      if (questionResult.questionNumber && questionResult.questionNumber !== info.currentRound) {
        console.log(`Syncing round from questionResult: ${info.currentRound} -> ${questionResult.questionNumber}`);
        info.currentRound = questionResult.questionNumber;
        this.saveRoundInfo(info);
      }
    }
  }

  // 验证轮次一致性
  static validateRoundConsistency(gameSessionId: string, expectedRound: number): boolean {
    const info = this.loadRoundInfo();
    if (!info || info.gameSessionId !== gameSessionId) {
      return false;
    }

    const isConsistent = info.currentRound === expectedRound;
    if (!isConsistent) {
      console.warn(`Round inconsistency detected: stored=${info.currentRound}, expected=${expectedRound}`);
    }

    return isConsistent;
  }
}

// 导出便捷函数
export const saveGameRound = GameRoundManager.saveRoundInfo;
export const loadGameRound = GameRoundManager.loadRoundInfo;
export const clearGameRound = GameRoundManager.clearRoundInfo;
export const saveResumeInfo = GameRoundManager.saveResumeInfo;
export const loadResumeInfo = GameRoundManager.loadAndClearResumeInfo;