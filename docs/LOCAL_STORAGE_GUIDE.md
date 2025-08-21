# 本地存储功能使用指南

## 概述

本游戏实现了完整的本地存储功能，支持游戏进度保存、玩家设置管理、历史记录存储和统计数据跟踪。

## 主要功能

### 1. 游戏进度保存
- **自动保存**：游戏过程中自动保存进度（每30秒或用户操作时）
- **断线重连**：页面刷新或意外关闭后可恢复游戏
- **进度管理**：可手动清除保存的进度
- **过期清理**：超过24小时的进度自动清除

### 2. 玩家设置
- **游戏偏好**：默认游戏模式、题目数量、时间限制
- **界面设置**：音效开关、地图展开状态、主题选择
- **功能开关**：自动保存、显示提示等
- **语言设置**：界面语言选择

### 3. 游戏历史记录
- **完整记录**：保存每局游戏的详细信息
- **分数统计**：记录每题的得分和表现
- **时间记录**：游戏时长和完成时间
- **模式分类**：按游戏模式分类存储

### 4. 玩家统计
- **基础统计**：总游戏数、平均分、最高分
- **进阶数据**：连胜记录、游戏时长、完成率
- **成就系统**：解锁的成就和里程碑
- **偏好分析**：最喜欢的游戏模式等

## 技术实现

### 存储架构
```typescript
// 存储键名管理
const STORAGE_KEYS = {
  GAME_PROGRESS: 'time_guessr_game_progress',
  PLAYER_SETTINGS: 'time_guessr_player_settings',
  GAME_HISTORY: 'time_guessr_game_history',
  PLAYER_STATS: 'time_guessr_player_stats',
  CACHE_PREFIX: 'time_guessr_cache_',
}
```

### 数据结构
```typescript
// 游戏进度
interface GameProgress {
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

// 玩家设置
interface PlayerSettings {
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
```

### 核心管理类

#### GameProgressManager
- `saveProgress(progress)`: 保存游戏进度
- `loadProgress()`: 加载游戏进度
- `clearProgress()`: 清除游戏进度
- `hasProgress()`: 检查是否有保存的进度
- `updateProgress(updates)`: 更新特定字段

#### PlayerSettingsManager
- `saveSettings(settings)`: 保存玩家设置
- `loadSettings()`: 加载玩家设置
- `resetSettings()`: 重置为默认设置
- `getSetting(key)`: 获取单个设置
- `updateSetting(key, value)`: 更新单个设置

#### GameHistoryManager
- `addGame(game)`: 添加游戏记录
- `loadHistory()`: 加载游戏历史
- `clearHistory()`: 清除历史记录
- `getRecentGames(count)`: 获取最近的游戏
- `getBestGames(count)`: 获取最高分游戏

#### PlayerStatsManager
- `loadStats()`: 加载玩家统计
- `saveStats(stats)`: 保存玩家统计
- `updateAfterGame(result)`: 游戏完成后更新统计
- `resetStats()`: 重置统计数据
- `addAchievement(achievement)`: 添加成就

## 使用方法

### 在游戏中集成
```typescript
import {
  GameProgressManager,
  PlayerSettingsManager,
  GameHistoryManager,
  PlayerStatsManager
} from "@/lib/local-storage";

// 保存游戏进度
const saveGameProgress = () => {
  const progress = {
    gameSessionId,
    currentRound,
    totalRounds,
    // ... 其他数据
  };
  GameProgressManager.saveProgress(progress);
};

// 加载保存的进度
const loadSavedProgress = () => {
  const progress = GameProgressManager.loadProgress();
  if (progress) {
    // 恢复游戏状态
    setGameSessionId(progress.gameSessionId);
    setCurrentRound(progress.currentRound);
    // ... 恢复其他状态
  }
};
```

### 存储管理界面
游戏提供了完整的存储管理界面，包括：
- 存储空间使用情况显示
- 游戏设置调整
- 数据统计查看
- 数据导出/导入功能
- 清理操作

## 安全特性

### 数据验证
- JSON序列化/反序列化错误处理
- 数据格式验证
- 过期数据自动清理

### 存储限制
- 历史记录限制（最多100条）
- 存储空间监控
- 自动清理缓存数据

### 错误处理
- localStorage不可用时的降级处理
- 存储空间不足的警告
- 数据损坏时的恢复机制

## 性能优化

### 缓存策略
- 事件详情缓存（10分钟）
- 游戏结果缓存（1小时）
- 排行榜缓存（5分钟）

### 自动保存
- 用户操作时触发保存
- 定时自动保存（30秒间隔）
- 页面卸载时保存

### 存储优化
- 数据压缩存储
- 增量更新
- 批量操作

## 数据迁移

### 导出功能
```typescript
// 导出所有游戏数据
const exportData = () => {
  const data = exportGameData();
  // 下载JSON文件
};
```

### 导入功能
```typescript
// 导入游戏数据
const importData = (jsonData: string) => {
  const success = importGameData(jsonData);
  if (success) {
    // 数据导入成功
  }
};
```

## 最佳实践

### 开发建议
1. 始终检查localStorage可用性
2. 使用try-catch包装存储操作
3. 定期清理过期数据
4. 监控存储空间使用

### 用户体验
1. 提供清晰的存储状态反馈
2. 支持数据导出备份
3. 提供数据清理选项
4. 自动保存用户偏好

### 错误处理
1. 存储失败时的用户提示
2. 数据损坏时的恢复方案
3. 存储空间不足的处理
4. 浏览器兼容性处理

## 故障排除

### 常见问题
1. **数据丢失**：检查浏览器存储设置，确认未被清理
2. **保存失败**：检查存储空间，清理不必要的数据
3. **加载错误**：检查数据格式，重置损坏的数据
4. **性能问题**：清理缓存，减少存储数据量

### 调试工具
- 浏览器开发者工具 > Application > Local Storage
- 存储管理界面的数据统计
- 控制台错误日志
- 存储空间使用监控

## 未来扩展

### 计划功能
- 云端同步支持
- 多设备数据同步
- 更多统计维度
- 高级成就系统

### 技术升级
- IndexedDB支持
- Service Worker缓存
- 数据压缩优化
- 实时同步机制