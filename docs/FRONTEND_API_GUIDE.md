# Time Guessr Game API - 前端接口文档

本文档详细描述了新改版的游戏API接口，为前端开发者提供完整的接口调用指南。

## 基础信息

- **Base URL**: `https://your-api-domain.com`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token（部分接口需要）

## 接口列表

### 1. 开始新游戏

**接口**: `POST /game/start`

**描述**: 创建新的游戏会话，支持两级会话管理架构

**认证**: 不需要

**请求头**:
```
Content-Type: application/json
```

**请求参数**:
```typescript
interface StartGameRequest {
  gameMode: 'timed' | 'untimed';     // 游戏模式
  questionCount: number;              // 题目数量 (1-20)
  timeLimit?: number;                 // 时间限制（秒），timed模式时必需
}
```

**请求示例**:
```json
{
  "gameMode": "timed",
  "questionCount": 10,
  "timeLimit": 120
}
```

**响应格式**:
```typescript
interface StartGameResponse {
  success: boolean;
  data: {
    gameSessionId: string;           // 游戏会话ID
    eventIds: string[];              // 事件ID列表
    currentQuestion: number;         // 当前题目编号
    totalQuestions: number;          // 总题目数
    gameMode: string;                // 游戏模式
    timeLimit?: number;              // 时间限制
  };
}
```

**前端处理要点**:
1. 保存返回的 `gameSessionId`，后续提交答案时需要
2. 根据 `eventIds` 顺序获取题目信息
3. 根据 `gameMode` 显示相应的UI（计时器等）
4. 处理错误情况：题目数量不足、参数验证失败等

---

### 2. 提交游戏答案

**接口**: `POST /game/submit`

**描述**: 提交单个题目的答案，支持新的两级会话架构

**认证**: 需要 Bearer Token

**请求头**:
```
Content-Type: application/json
Authorization: Bearer <token>
```

**请求参数**:
```typescript
interface SubmitAnswerRequest {
  gameSessionId: string;              // 游戏会话ID
  eventId: string;                    // 事件ID
  guessedYear: number;                // 猜测的年份
  guessedLocation?: {                 // 猜测的位置（可选）
    lat: number;
    lng: number;
  };
  answerTime?: number;                // 答题时间（秒）
}
```

**请求示例**:
```json
{
  "gameSessionId": "game_123456",
  "eventId": "event_789",
  "guessedYear": 1969,
  "guessedLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "answerTime": 25
}
```

**响应格式**:
```typescript
interface SubmitAnswerResponse {
  success: boolean;
  data: {
    questionSessionId: string;       // 题目会话ID
    gameSessionId: string;           // 游戏会话ID
    status: 'submitted' | 'completed'; // 游戏状态
  };
}
```

**前端处理要点**:
1. 每次提交后检查 `status` 字段判断游戏是否完成
2. 保存 `questionSessionId` 用于获取详细结果
3. 如果 `status` 为 'completed'，跳转到结果页面
4. 处理错误：游戏已完成、事件不存在、会话无效等

---

### 3. 简化游戏提交（这块暂时不需要实现）

**接口**: `POST /game/submit-simple`

**描述**: 不需要认证的简化提交接口，适用于游客模式

**认证**: 不需要

**请求头**:
```
Content-Type: application/json
```

**请求参数**:
```typescript
interface SimpleGameSubmitRequest {
  eventId: string;                    // 事件ID
  guessedYear: number;                // 猜测的年份
  guessedLat: number;                 // 猜测的纬度
  guessedLng: number;                 // 猜测的经度
}
```

**请求示例**:
```json
{
  "eventId": "event_789",
  "guessedYear": 1969,
  "guessedLat": 40.7128,
  "guessedLng": -74.0060
}
```

**响应格式**:
```typescript
interface GameSubmitResponse {
  success: boolean;
  result: ScoringResult;              // 评分结果
  playerStats?: PlayerStats;          // 玩家统计（简化模式为空）
}
```

**前端处理要点**:
1. 适用于单题模式或游客体验
2. 不保存游戏记录，仅返回评分结果
3. 可用于快速体验功能

---

### 4. 获取游戏结果

**接口**: `GET /game/result/{gameSessionId}`

**描述**: 获取完整游戏会话的结果统计

**认证**: 不需要

**路径参数**:
- `gameSessionId`: 游戏会话ID

**响应格式**:
```typescript
interface GameResultResponse {
  success: boolean;
  data: {
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
  };
}
```

**前端处理要点**:
1. 在游戏完成后调用此接口获取总体结果
2. 显示总分、平均分、完成度等统计信息
3. 可以基于 `questionSessions` 显示每题的简要结果
4.处理游戏未完成的情况

---

### 5. 获取单题详细结果

**接口**: `GET /game/question-result/{questionSessionId}`

**描述**: 获取单个题目的详细评分和分析结果

**认证**: 不需要

**路径参数**:
- `questionSessionId`: 题目会话ID

**响应格式**:
```typescript
interface QuestionResultResponse {
  success: boolean;
  data: {
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
  };
}
```

**前端处理要点**:
1. 用于显示详细的答题分 析页面
2. 可以在地图上标注猜测位置和实际位置
3. 显示各项评分细节和成就
4. 根据 `rank` 显示相应的评级图标或颜色

---

### 6. 获取排行榜

**接口**: `GET /game/leaderboard`

**描述**: 获取游戏排行榜数据

**认证**: 需要 Bearer Token

**查询参数**:
- `type`: 排行榜类型 (默认: 'all_time')
- `limit`: 返回数量 (默认: 10)
- `difficulty`: 难度级别 (可选)

**请求示例**:
```
GET /game/leaderboard?type=weekly&limit=20&difficulty=hard
```

**响应格式**:
```typescript
interface LeaderboardResponse {
  success: boolean;
  data: Array<{
    playerId: string;
    playerName?: string;
    totalScore: number;
    gamesPlayed: number;
    averageScore: number;
    rank: number;
  }>;
  total: number;
  page: number;
  limit: number;
}
```

**前端处理要点**:
1. 支持不同时间范围的排行榜切换
2. 可以按难度级别筛选
3. 实现分页加载更多数据
4. 高亮当前用户的排名

---

### 7. 获取玩家统计

**接口**: `GET /game/stats/{playerId}`

**描述**: 获取指定玩家的详细统计信息

**认证**: 需要 Bearer Token

**路径参数**:
- `playerId`: 玩家ID

**响应格式**:
```typescript
interface PlayerStats {
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
```

**前端处理要点**:
1. 显示玩家的个人成就和统计数据
2. 可以用于个人资料页面
3. 展示技能等级和评级变化
4. 处理玩家不存在的情况

---

### 8. 获取事件详情

**接口**: `GET /events/{eventId}`

**描述**: 获取单个事件的详细信息

**认证**: 不需要

**路径参数**:
- `eventId`: 事件ID

**响应格式**:
```typescript
interface EventDetailResponse {
  success: boolean;
  data: {
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
```

**前端处理要点**:
1. 用于获取游戏中单个题目的事件信息
2. 在游戏开始时根据 `eventIds` 列表获取题目详情
3. 可以用于题目预览或详情展示
4. 处理事件不存在的情况

---

### 9. 获取游戏分析数据

**接口**: `GET /game/analytics`

**描述**: 获取游戏的分析统计数据

**认证**: 需要 Bearer Token

**查询参数**:
- `playerId`: 玩家ID (可选)
- `timeRange`: 时间范围 (默认: '7d')

**请求示例**:
```
GET /game/analytics?playerId=player123&timeRange=30d
```

**响应格式**:
```typescript
interface GameStats {
  totalGames: number;
  totalPlayers: number;
  averageScore: number;
  popularEvents: Array<{
    eventId: string;
    playCount: number;
    averageScore: number;
  }>;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  timeRange: string;
}
```

**前端处理要点**:
1. 用于管理后台或数据分析页面
2. 可以生成图表展示趋势数据
3. 支持不同时间范围的数据查看
4. 可以按玩家筛选个人分析数据

---

## 错误处理

所有接口都遵循统一的错误响应格式：

```typescript
interface ErrorResponse {
  success: false;
  error: {
    type: string;                    // 错误类型
    message: string;                 // 错误消息
    details?: string[];              // 详细错误信息
    code?: number;                   // 错误代码
  };
}
```

**常见错误类型**:
- `VALIDATION_ERROR`: 参数验证失败
- `DATABASE_ERROR`: 数据库操作失败
- `NOT_FOUND_ERROR`: 资源不存在
- `AUTHENTICATION_ERROR`: 认证失败
- `AUTHORIZATION_ERROR`: 权限不足

**前端错误处理建议**:
1. 统一的错误处理函数
2. 根据错误类型显示相应的用户友好消息
3. 对于网络错误实现重试机制
4. 记录错误日志用于调试

---

## 页面架构与数据流设计

### 游戏流程中的接口调用策略

#### 1. 游戏开始流程

```typescript
// 1. 开始游戏
const gameResponse = await startGame({
  gameMode: 'timed',
  questionCount: 10,
  timeLimit: 120
});

const { gameSessionId, eventIds } = gameResponse.data;

// 2. 获取题目信息
const events = await Promise.all(
  eventIds.map(eventId => getEventDetail(eventId))
);
```

#### 2. 游戏进行中的接口调用

```typescript
// 每题提交答案的流程
for (let i = 0; i < eventIds.length; i++) {
  const eventId = eventIds[i];
  
  // 显示题目，等待用户答题
  const answer = await waitForUserAnswer(events[i]);
  
  // 提交答案
  const submitResponse = await submitAnswer({
    gameSessionId,
    eventId,
    guessedYear: answer.year,
    guessedLocation: answer.location,
    answerTime: answer.time
  });
  
  const { questionSessionId, status } = submitResponse.data;
  
  // 获取单题结果（可选，用于即时反馈）
  const questionResult = await getQuestionResult(questionSessionId);
  showQuestionResult(questionResult);
  
  // 检查是否为最后一题
  if (status === 'completed') {
    // 跳转到最终结果页面
    navigateToFinalResults(gameSessionId);
    break;
  }
}
```

#### 3. 游戏最后一题的特殊处理

**重要**: 游戏最后一题提交后，结果页面需要展示完整的游戏信息，包括：
- 当前题目的详细结果
- 整局游戏的总体统计
- 所有题目的汇总信息

**推荐的接口调用顺序**：
```typescript
// 最后一题提交后的处理流程
async function handleFinalQuestion(gameSessionId, lastQuestionSessionId) {
  // 方案1: 并行获取数据（推荐）
  const [questionResult, gameResult] = await Promise.all([
    getQuestionResult(lastQuestionSessionId),  // 当前题目详细结果
    getGameResult(gameSessionId)               // 游戏总体结果
  ]);
  
  // 展示综合结果页面
  showFinalResultsPage({
    currentQuestion: questionResult,
    gameOverview: gameResult,
    allQuestions: gameResult.data.questionSessions
  });
}

// 方案2: 分步获取（适用于需要分步展示的场景）
async function handleFinalQuestionStepByStep(gameSessionId, lastQuestionSessionId) {
  // 1. 先显示当前题目结果
  const questionResult = await getQuestionResult(lastQuestionSessionId);
  showQuestionResult(questionResult);
  
  // 2. 然后获取并显示游戏总结
  const gameResult = await getGameResult(gameSessionId);
  showGameSummary(gameResult);
}
```

### 结果页面设计策略

#### 1. 游戏完成后的结果页面

当游戏完成时（`POST /game/submit` 返回 `status: 'completed'`），建议的页面架构：

**主要调用接口**：
- **必需**: `GET /game/result/{gameSessionId}` - 获取游戏总体统计
- **必需**: `GET /game/question-result/{questionSessionId}` - 获取最后一题的详细结果
- **可选**: 按需获取其他题目的详细结果

**页面结构建议**：
```typescript
// 最终结果页面组件结构
interface FinalResultPageProps {
  gameSessionId: string;
  lastQuestionSessionId: string;
}

// 页面数据流
1. 页面加载时并行调用:
   - /game/result/{gameSessionId} (游戏总体结果)
   - /game/question-result/{lastQuestionSessionId} (最后一题详情)
2. 显示当前题目的详细分析（位置对比、评分详情等）
3. 显示游戏总体结果（总分、平均分、完成度等）
4. 显示所有题目的简要结果列表
5. 用户点击其他题目时，调用对应的 /game/question-result/{questionSessionId}
6. 提供分享功能和继续游戏选项
```

**结果页面展示内容**：
```typescript
// 推荐的页面布局
interface FinalResultPageLayout {
  // 顶部：游戏总体统计
  gameOverview: {
    totalScore: number;
    averageScore: number;
    questionsCompleted: number;
    gameMode: string;
    completedAt: string;
  };
  
  // 中部：当前题目详细结果
  currentQuestionDetail: {
    questionNumber: number;
    actualVsGuessed: {
      year: { actual: number; guessed: number; };
      location: { actual: LatLng; guessed: LatLng; };
    };
    scoringBreakdown: ScoringDetails;
    mapVisualization: boolean; // 显示位置对比地图
  };
  
  // 底部：所有题目汇总
  allQuestionsOverview: {
    questionList: QuestionSummary[];
    achievements: string[];
    shareOptions: ShareConfig;
  };
}
```

**不建议在结果页调用的接口**：
- 排行榜、玩家统计、游戏分析等接口不应在结果页调用
- 这些数据应该在专门的页面中展示

#### 2. 单题结果展示策略

**即时反馈模式**（推荐）：
```typescript
// 每题提交后立即显示结果
async function submitAnswer(answerData) {
  const response = await submitAnswerAPI(answerData);
  
  if (response.success) {
    // 立即获取单题详细结果
    const questionResult = await getQuestionResult(response.data.questionSessionId);
    
    // 显示单题结果弹窗或页面
    showQuestionResult(questionResult);
    
    // 检查游戏是否完成
    if (response.data.status === 'completed') {
      // 跳转到最终结果页面
      navigateToFinalResults(response.data.gameSessionId);
    } else {
      // 继续下一题
      loadNextQuestion();
    }
  }
}
```

**延迟展示模式**：
```typescript
// 游戏结束后统一展示所有题目结果
async function showFinalResults(gameSessionId) {
  const gameResult = await getGameResult(gameSessionId);
  
  // 可以选择性地获取每题详情
  const questionDetails = await Promise.all(
    gameResult.data.questionSessions.map(q => 
      getQuestionResult(q.questionSessionId)
    )
  );
  
  // 展示完整的结果页面
  renderResultsPage(gameResult, questionDetails);
}
```

### 统计数据的展示位置

#### 1. 排行榜数据 (`GET /game/leaderboard`)

**数据性质**: 全局统计数据，不是单题或单局游戏的数据

**展示位置**:
- **主菜单/首页**: 显示全球排行榜
- **专门的排行榜页面**: 支持筛选和分页
- **个人资料页**: 显示用户在排行榜中的位置

**调用时机**:
```typescript
// 首页加载时
useEffect(() => {
  loadLeaderboard({ type: 'weekly', limit: 10 });
}, []);

// 排行榜页面
const [leaderboardData, setLeaderboardData] = useState([]);
const [filters, setFilters] = useState({ type: 'all_time', difficulty: 'all' });

useEffect(() => {
  loadLeaderboard(filters);
}, [filters]);
```

#### 2. 玩家统计 (`GET /game/stats/{playerId}`)

**数据性质**: 个人累计统计数据，跨所有游戏会话

**展示位置**:
- **个人资料页面**: 主要展示位置
- **游戏结束页面**: 可以显示简化版本（如当前等级、总游戏数）
- **设置页面**: 显示账户相关统计

**调用时机**:
```typescript
// 个人资料页面
useEffect(() => {
  if (currentUser?.playerId) {
    loadPlayerStats(currentUser.playerId);
  }
}, [currentUser]);

// 游戏结束页面（可选）
const showBriefPlayerStats = async (playerId) => {
  const stats = await getPlayerStats(playerId);
  return {
    level: stats.skillLevel,
    totalGames: stats.totalGames,
    currentStreak: stats.currentStreak
  };
};
```

#### 3. 游戏分析数据 (`GET /game/analytics`)

**数据性质**: 系统级分析数据，用于管理和趋势分析

**展示位置**:
- **管理后台**: 主要用途
- **数据分析页面**: 面向高级用户
- **开发者控制台**: 用于监控和优化

**调用时机**:
```typescript
// 管理后台
const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  
  useEffect(() => {
    loadGameAnalytics({ timeRange });
  }, [timeRange]);
};

// 个人分析页面（可选功能）
const PersonalAnalytics = ({ playerId }) => {
  useEffect(() => {
    loadGameAnalytics({ playerId, timeRange: '30d' });
  }, [playerId]);
};
```

### 推荐的页面结构

```
应用架构:
├── 首页/主菜单
│   ├── 开始游戏按钮
│   ├── 简化排行榜 (top 5) - 调用 GET /game/leaderboard
│   └── 个人简要统计
├── 游戏页面
│   ├── 题目展示 - 调用 GET /events/{eventId}
│   ├── 答题界面 - 调用 POST /game/submit
│   └── 单题结果弹窗 - 调用 GET /game/question-result/{questionSessionId}
├── 游戏结果页面 (最后一题特殊处理)
│   ├── 当前题目详细结果 - 调用 GET /game/question-result/{questionSessionId}
│   ├── 游戏总体结果 - 调用 GET /game/result/{gameSessionId}
│   ├── 所有题目汇总列表
│   ├── 位置对比地图展示
│   ├── 评分详情分析
│   └── 分享和继续游戏选项
├── 排行榜页面
│   ├── 全局排行榜 - 调用 GET /game/leaderboard
│   ├── 筛选功能 (类型、难度、时间范围)
│   └── 分页加载
├── 个人资料页面
│   ├── 个人统计 - 调用 GET /game/stats/{playerId}
│   ├── 成就展示
│   ├── 历史记录
│   └── 个人分析 (可选)
└── 管理后台 (可选)
    ├── 系统分析 - 调用 GET /game/analytics
    ├── 用户管理
    └── 游戏数据监控
```

### 关键接口调用时机说明

#### 1. 游戏流程中的接口调用

```typescript
// 游戏开始
POST /game/start → 获取 gameSessionId 和 eventIds

// 获取题目信息
GET /events/{eventId} → 为每个 eventId 获取题目详情

// 答题过程
POST /game/submit → 提交答案，获取 questionSessionId
GET /game/question-result/{questionSessionId} → 获取单题详细结果

// 游戏结束 (最后一题)
POST /game/submit (status: 'completed')
↓
并行调用:
├── GET /game/question-result/{questionSessionId} (最后一题详情)
└── GET /game/result/{gameSessionId} (游戏总结)
```

#### 2. 各页面的数据获取策略

**首页/主菜单**:
- 页面加载时调用 `GET /game/leaderboard?limit=5` 显示简化排行榜
- 如果用户已登录，可显示个人简要统计

**游戏页面**:
- 游戏开始时批量获取所有题目信息: `GET /events/{eventId}`
- 每题提交后立即获取结果: `GET /game/question-result/{questionSessionId}`
- 最后一题需要特殊处理，同时获取单题和游戏总结

**结果页面**:
- 必须同时展示当前题目详情和游戏总体统计
- 支持查看其他题目的详细结果
- 提供位置对比地图和评分分析

**排行榜页面**:
- 支持不同类型的排行榜切换
- 实现筛选和分页功能
- 定期刷新数据

**个人资料页面**:
- 显示累计统计数据
- 展示个人成就和历史记录
- 可选的个人分析功能

### 数据缓存建议

```typescript
// 不同数据的缓存策略
const cacheStrategies = {
  gameResult: {
    duration: '永久', // 游戏结果不会改变
    storage: 'localStorage'
  },
  questionResult: {
    duration: '永久', // 题目结果不会改变
    storage: 'localStorage'
  },
  leaderboard: {
    duration: '5分钟', // 排行榜数据变化较快
    storage: 'memory'
  },
  playerStats: {
    duration: '1小时', // 个人统计变化相对较慢
    storage: 'localStorage'
  },
  analytics: {
    duration: '30分钟', // 分析数据更新频率中等
    storage: 'memory'
  }
};
```

---

## 最佳实践

### 1. 游戏流程建议

```typescript
// 1. 开始游戏
const gameResponse = await startGame({
  gameMode: 'timed',
  questionCount: 10,
  timeLimit: 120
});

const { gameSessionId, eventIds } = gameResponse.data;

// 2. 循环处理每个题目
for (const eventId of eventIds) {
  // 显示题目，等待用户答题
  const answer = await waitForUserAnswer(eventId);
  
  // 提交答案
  const submitResponse = await submitAnswer({
    gameSessionId,
    eventId,
    guessedYear: answer.year,
    guessedLocation: answer.location,
    answerTime: answer.time
  });
  
  // 检查游戏是否完成
  if (submitResponse.data.status === 'completed') {
    break;
  }
}

// 3. 获取最终结果
const finalResult = await getGameResult(gameSessionId);
```

### 2. 状态管理建议

```typescript
interface GameState {
  gameSessionId?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  eventIds: string[];
  gameMode: 'timed' | 'untimed';
  timeLimit?: number;
  isCompleted: boolean;
  questionSessions: string[];  // 保存每题的questionSessionId
}
```

### 3. 缓存策略

- 游戏会话信息可以缓存到 localStorage
- 题目结果可以缓存避免重复请求
- 排行榜数据可以设置短期缓存

### 4. 用户体验优化

- 实现加载状态指示器
- 提供离线模式支持
- 添加答题进度保存功能
- 实现平滑的页面转换动画

---

## 版本信息

- **API版本**: v2.0
- **文档版本**: 1.0
- **最后更新**: 2024年

如有疑问或需要技术支持，请联系开发团队。