# 游戏页面流程及交互逻辑

1. 进入游戏页面时， 调用 /game/start 获取游戏会话ID、currentRound及游戏 eventIds
2. 根据 currentRound 获取当前题目 eventId
3. 调用 /event/{eventId} 获取题目详情
4. 用户提交答案后，调用 /game/submit 提交答案
5. 接口返回后， 调用 /game/result/{gameSessionId} 获取游戏结果
6. 在游戏结果页中， 点击继续游戏，返回 game 游戏页面， 此时 currentRound 加一
7. 调用 /event/{eventId} 获取题目详情， 重复步骤3-5
8. 当 currentRound 等于游戏总轮数时， 游戏结束

## 注意事项
1. 结合 /docs/FRONTED_API_GUIDE.md 和 FRONTEND_STATE_MANAGEMENT.md 文档， 理解接口返回值和前端状态管理
2. 梳理现有的流程， 确认是否有遗漏的步骤
3. 保证游戏流程的正确性， 避免用户跳过题目或重复提交答案
4. 当用户在第三题时， 刷新页面或退出页面， 再次进入时， 还能回到第三题， 不用再重新开始
