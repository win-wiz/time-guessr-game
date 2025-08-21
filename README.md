# Time Guessr 游戏

Time Guessr 是一个历史地理猜谜游戏，玩家需要根据历史照片猜测事件发生的年份和地点。

## 主要功能

- 根据历史照片猜测事件发生的年份和地点
- 实时评分系统，根据猜测的准确度给予分数
- 详细的结果展示，包括地图位置对比和成就系统
- 游戏进度保存和恢复功能
- 排行榜系统

## 技术栈

- Next.js 14 (React 框架)
- TypeScript
- Tailwind CSS (样式)
- Google Maps API (地图展示)

## 最近更新

### 题目结果展示系统

我们新增了一个详细的题目结果展示系统，包含以下功能：

1. **详细数据展示**：展示接口返回的完整日志数据
2. **图片详情信息**：显示历史事件的图片和详细描述
3. **猜测对比**：清晰展示玩家猜测与实际情况的对比
4. **地图集成**：
   - 在地图上同时标注实际位置和玩家选择的位置
   - 用连线连接两个位置点
   - 自动计算并显示距离差
5. **成就系统**：展示玩家获得的成就和奖励

## 安装与设置

1. 克隆仓库
```bash
git clone <repository-url>
cd time-guessr-game
```

2. 安装依赖
```bash
npm install
```

3. 设置环境变量
创建 `.env.local` 文件并添加必要的环境变量：
```
NEXT_PUBLIC_API_BASE_URL=<your-api-base-url>
NEXT_PUBLIC_API_KEY=<your-api-key>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

关于 Google Maps API 的设置，请参考 [Google Maps 设置指南](./docs/GOOGLE_MAPS_SETUP.md)。

4. 启动开发服务器
```bash
npm run dev
```

## 使用流程

1. 开始游戏：访问首页并点击"开始游戏"
2. 猜测：查看历史照片，猜测年份并在地图上标记位置
3. 提交：点击提交按钮提交答案
4. 查看结果：系统会自动跳转到结果页面，展示详细的猜测结果
5. 继续游戏：可以选择继续游戏或查看总体结果

## API 接口

游戏使用以下主要 API 接口：

- `/api/game/start` - 开始新游戏
- `/api/game/submit` - 提交答案
- `/api/game/question-result/:questionSessionId` - 获取题目结果
- `/api/game/result/:gameSessionId` - 获取游戏总结果

详细的 API 文档请参考 [前端 API 指南](./docs/FRONTEND_API_GUIDE.md)。

## 贡献指南

欢迎贡献代码、报告问题或提出新功能建议。请遵循以下步骤：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)