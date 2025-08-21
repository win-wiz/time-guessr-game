# 游戏组件架构

本目录包含了游戏页面的所有拆分组件，每个组件都经过性能优化，使用 React.memo、useCallback 和 useMemo 来避免不必要的重渲染。

## 组件列表

### 1. BackgroundImage
- **功能**: 游戏背景图片显示
- **优化**: 使用 memo 包装，避免不必要的重渲染
- **Props**: imageUrl

### 2. GameHeader
- **功能**: 游戏顶部导航栏，包含logo、进度条和主题切换
- **优化**: 使用 memo 包装
- **Props**: currentRound, totalRounds, scores

### 3. MobileInfoPanel
- **功能**: 移动端信息面板，包含游戏信息和年份控制
- **优化**: 内部子组件使用 memo，事件处理使用 useCallback
- **Props**: eventName, currentRound, totalRounds, timeRemaining, guessLocation, selectedYear, onYearChange, currentYear

### 4. DesktopStatusPanel
- **功能**: 桌面端右侧状态面板，显示时间、年份选择器和位置状态
- **优化**: 使用 memo 和 useCallback 优化事件处理
- **Props**: timeRemaining, selectedYear, onYearChange, guessLocation, currentYear

### 5. GameHint
- **功能**: 桌面端左上角游戏提示
- **优化**: 使用 memo 包装
- **Props**: eventName, currentRound, totalRounds

### 6. SubmitButton
- **功能**: 提交猜测按钮，支持移动端和桌面端样式
- **优化**: 使用 memo 和 useMemo 优化样式计算
- **Props**: onSubmit, guessLocation, isMobile

### 7. MapContainer
- **功能**: 地图容器，包含地图展开/收缩功能
- **优化**: 使用 memo 和 useCallback 优化事件处理
- **Props**: onMapClick, guessLocation, isMapExpanded, onToggleExpanded

### 8. GameResultsPage
- **功能**: 游戏结果页面
- **优化**: 使用 memo 包装
- **Props**: currentEvent, currentRound, totalRounds, guessLocation, scores, onNextRound

### 9. GameSummaryPage
- **功能**: 游戏总结页面
- **优化**: 使用 memo 包装
- **Props**: totalRounds, totalScore, scores, onPlayAgain

## 性能优化策略

1. **React.memo**: 所有组件都使用 memo 包装，避免父组件重渲染时的不必要子组件渲染
2. **useCallback**: 所有事件处理函数都使用 useCallback 缓存
3. **useMemo**: 计算值和样式对象使用 useMemo 缓存
4. **组件拆分**: 将大型组件拆分为小型、专注的组件，提高可维护性和性能

## 使用方式

```typescript
import {
  BackgroundImage,
  GameHeader,
  MobileInfoPanel,
  DesktopStatusPanel,
  GameHint,
  SubmitButton,
  MapContainer,
  GameResultsPage,
  GameSummaryPage
} from '@/components/game';
```

或者单独导入：

```typescript
import { BackgroundImage } from '@/components/game/background-image';