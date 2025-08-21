# 时间猜测游戏评分机制设计文档

## 1. 游戏概述

时间猜测游戏（Time Guessr）是一款结合历史时间和地理位置的猜测游戏。玩家需要：
- 根据图片内容猜测拍摄的年份
- 在地图上标记拍摄地点的经纬度
- 提交答案获得评分

## 2. 评分维度分析

### 2.1 时间维度评分
**核心原理：** 时间差距越小，得分越高

#### 评分公式
```
时间得分 = max(0, 1000 - |实际年份 - 猜测年份| × 时间惩罚系数)

时间惩罚系数建议值：
- 1年内：惩罚系数 = 10
- 1-5年：惩罚系数 = 15  
- 5-10年：惩罚系数 = 20
- 10年以上：惩罚系数 = 25
```

#### 时间评分等级
- **完美 (Perfect)**: 猜中确切年份 → 1000分
- **优秀 (Excellent)**: 1年内 → 990-999分
- **很好 (Great)**: 2-3年内 → 950-989分
- **良好 (Good)**: 4-5年内 → 900-949分
- **一般 (Fair)**: 6-10年内 → 750-899分
- **较差 (Poor)**: 11-20年内 → 500-749分
- **很差 (Bad)**: 20年以上 → 0-499分

### 2.2 地理位置维度评分
**核心原理：** 距离越近，得分越高

#### 距离计算
使用Haversine公式计算两点间的球面距离：
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

#### 地理评分公式
```
地理得分 = max(0, 1000 - distance × 距离惩罚系数)

距离惩罚系数建议值：
- 0-1km：惩罚系数 = 5
- 1-10km：惩罚系数 = 10
- 10-100km：惩罚系数 = 15
- 100km以上：惩罚系数 = 20
```

#### 地理评分等级
- **完美 (Perfect)**: 100米内 → 995-1000分
- **优秀 (Excellent)**: 1公里内 → 950-994分
- **很好 (Great)**: 5公里内 → 900-949分
- **良好 (Good)**: 25公里内 → 750-899分
- **一般 (Fair)**: 100公里内 → 500-749分
- **较差 (Poor)**: 500公里内 → 250-499分
- **很差 (Bad)**: 500公里以上 → 0-249分

## 3. 综合评分算法

### 3.1 基础综合评分
```
总分 = (时间得分 × 时间权重 + 地理得分 × 地理权重) / (时间权重 + 地理权重)

建议权重配置：
- 时间权重：0.6 (60%)
- 地理权重：0.4 (40%)
```

### 3.2 奖励机制

#### 连击奖励 (Streak Bonus)
```
连击奖励 = min(连击次数 × 50, 500)

连击定义：连续获得"良好"以上评分
- 2连击：+100分
- 3连击：+150分
- 5连击：+250分
- 10连击：+500分（封顶）
```

#### 完美奖励 (Perfect Bonus)
```
双维度完美：额外+500分
单维度完美：额外+200分
```

#### 速度奖励 (Speed Bonus)
```
速度奖励 = max(0, (120 - 答题秒数) × 5)

- 30秒内：+450分
- 60秒内：+300分
- 90秒内：+150分
- 120秒内：+0分
- 超时：-100分
```

### 3.3 最终评分公式
```
最终得分 = 基础综合评分 + 连击奖励 + 完美奖励 + 速度奖励
最大可能得分 = 2500分
```

## 4. 难度调节机制

### 4.1 动态难度调整
根据玩家历史表现调整评分标准：

```javascript
// 玩家能力评估
const playerSkillLevel = calculatePlayerSkill(recentScores);

// 难度调整系数
const difficultyMultiplier = {
  beginner: 1.2,    // 新手：更宽松的评分
  intermediate: 1.0, // 中级：标准评分
  expert: 0.8       // 专家：更严格的评分
};
```

### 4.2 图片难度分级
为每张图片设置难度等级：

- **简单 (Easy)**: 明显的时代特征，著名地标
- **中等 (Medium)**: 一般的时代特征，常见地点
- **困难 (Hard)**: 模糊的时代特征，偏僻地点
- **专家 (Expert)**: 极难识别的时代和地点

```javascript
const difficultyBonus = {
  easy: 1.0,
  medium: 1.1,
  hard: 1.3,
  expert: 1.5
};
```

## 5. 排行榜和成就系统

### 5.1 排行榜计算
```javascript
// 玩家总评分 = 最近20局平均分 × 0.7 + 历史最高分 × 0.3
const playerRating = (recentAverage * 0.7) + (historicalBest * 0.3);
```

### 5.2 成就系统
- **时间大师**: 连续10次时间猜测在3年内
- **地理专家**: 连续10次位置猜测在10km内
- **闪电侠**: 平均答题时间少于45秒
- **完美主义者**: 获得10次双维度完美
- **坚持不懈**: 连续游戏30天

## 6. 实现建议

### 6.1 数据库设计
```sql
-- 游戏记录表
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  player_id UUID,
  image_id UUID,
  guessed_year INTEGER,
  actual_year INTEGER,
  guessed_lat DECIMAL(10,8),
  guessed_lng DECIMAL(11,8),
  actual_lat DECIMAL(10,8),
  actual_lng DECIMAL(11,8),
  time_score INTEGER,
  location_score INTEGER,
  bonus_score INTEGER,
  final_score INTEGER,
  answer_time INTEGER, -- 秒
  difficulty_level VARCHAR(20),
  created_at TIMESTAMP
);

-- 玩家统计表
CREATE TABLE player_stats (
  player_id UUID PRIMARY KEY,
  total_games INTEGER,
  average_score DECIMAL(6,2),
  best_score INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  total_perfect_guesses INTEGER,
  skill_level VARCHAR(20),
  updated_at TIMESTAMP
);
```

### 6.2 API接口设计
```javascript
// 提交答案接口
POST /api/game/submit
{
  "sessionId": "uuid",
  "guessedYear": 1995,
  "guessedLat": 40.7128,
  "guessedLng": -74.0060,
  "answerTime": 67
}

// 响应
{
  "success": true,
  "result": {
    "timeScore": 850,
    "locationScore": 720,
    "bonusScore": 300,
    "finalScore": 1870,
    "timeAccuracy": "3年差距",
    "locationAccuracy": "15.2公里",
    "rank": "很好",
    "achievements": ["速度奖励"],
    "streak": 3
  }
}
```

### 6.3 前端展示建议
1. **实时反馈**: 提交后立即显示各维度得分
2. **视觉化对比**: 用地图和时间轴显示差距
3. **进度动画**: 分数增长动画增强成就感
4. **社交分享**: 支持分享高分和成就

## 7. 平衡性调优

### 7.1 A/B测试建议
- 测试不同的权重配置
- 测试不同的惩罚系数
- 测试奖励机制的效果

### 7.2 数据监控指标
- 玩家留存率
- 平均游戏时长
- 分数分布情况
- 难度感知调查

### 7.3 定期调整
建议每月根据数据分析结果调整评分参数，确保游戏的挑战性和趣味性。

## 8. 防作弊机制

### 8.1 异常检测
- 答题时间过短检测
- 分数异常波动检测
- IP地址和设备指纹检测

### 8.2 验证机制
- 服务端验证所有计算
- 图片元数据验证
- 答案合理性检查

这套评分机制既保证了公平性，又通过多样化的奖励机制增强了游戏的吸引力和可玩性。