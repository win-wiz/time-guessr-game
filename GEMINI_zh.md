# TimeGuessr 游戏 - Qwen Code 项目上下文

## 项目概述

这是一个基于 Next.js 15 的 Web 应用程序，实现了一个名为“TimeGuessr”的地理/历史猜测游戏。核心玩法包括：

1.  向用户展示一个历史事件，包括一张图片和一段描述。
2.  用户必须在地图上（使用 Google Maps API）猜测事件发生的地点和年份。
3.  游戏根据位置猜测（与实际位置的距离）和年份猜测的准确性来计算分数。
4.  游戏共进行 5 轮，最后会显示分数总结。

该项目最近已从使用 Firebase 进行数据存储迁移到与第三方 API 集成以获取历史事件和验证位置。它使用 TypeScript、Tailwind CSS 进行样式设计，并使用了来自 `shadcn/ui` 的几个 UI 组件。

## 项目结构

-   **框架:** Next.js 15 (App Router)
-   **语言:** TypeScript
-   **样式:** Tailwind CSS
-   **UI 库:** shadcn/ui 组件
-   **地图:** 通过 `@react-google-maps/api` 使用 Google Maps API
-   **状态管理:** React hooks (`useState`, `useEffect`)
-   **数据源:** 第三方 API (通过环境变量配置)

关键目录：
-   `src/app/`: Next.js App Router 页面和 API 路由。
-   `src/components/`: 可复用的 UI 组件 (例如，游戏地图、控件、结果)。
-   `src/lib/`: 工具函数和数据服务层。

## 构建和运行

### 先决条件

1.  Node.js (Next.js 15 指定的版本，可能是 18.x 或 20.x)
2.  包管理器: `npm`, `yarn`, 或 `pnpm`。项目中包含了 `npm` 和 `pnpm` 的锁文件。

### 环境变量

在运行之前，您需要配置环境变量。复制 `.env.example` 为 `.env.local` 并填入相应的值：

-   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: 用于地图组件的 Google Maps API 密钥。
-   `NEXT_PUBLIC_API_BASE_URL`: 第三方 API 的基础 URL，用于获取事件/位置。
-   `NEXT_PUBLIC_API_KEY`: 用于向第三方 API 进行身份验证的 API 密钥。

### 开发服务器

要启动开发服务器，请运行以下命令之一：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

这将启动 Next.js 开发服务器，通常在 `http://localhost:3000`。导航到 `/game` 开始游戏。

### 生产构建

要创建生产构建，请运行：

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

构建完成后，要启动生产服务器，请运行：

```bash
npm run start
# 或
yarn start
# 或
pnpm start
```

### 代码检查

要检查代码规范错误，请运行：

```bash
npm run lint
# 或
yarn lint
# 或
pnpm lint
```

## 开发规范

-   **组件结构:** UI 组件位于 `src/components/`。它们通常使用 `shadcn/ui` 原语和 Tailwind CSS 构建。
-   **数据获取:** 数据获取逻辑集中在 `src/lib/data-service.ts`。此服务处理与第三方 API 的通信。
-   **API 路由:** 自定义 API 路由定义在 `src/app/api/` 下。这些通常作为代理或包装器，围绕 `data-service.ts` 中定义的第三方 API 调用。
-   **游戏逻辑:** 游戏特定的工具，如分数计算和距离计算，在 `src/lib/game-utils.ts` 中。
-   **样式:** 使用 Tailwind CSS 进行样式设计，并配置了深色模式。自定义颜色在 `tailwind.config.ts` 中定义。
-   **类型安全:** 全程使用 TypeScript 以确保类型安全。事件和位置的数据结构在 `src/lib/data-service.ts` 中定义。

## 关键文件

-   `src/app/game/page.tsx`: 主游戏页面组件，管理游戏状态并渲染游戏组件。
-   `src/lib/data-service.ts`: 与第三方 API 交互以获取事件和位置的中央服务。
-   `src/components/game-map.tsx`: 用户放置位置猜测的交互式 Google 地图组件。
-   `src/components/game-controls.tsx`: 用于提交猜测和选择年份的组件。
-   `src/components/game-results.tsx`: 显示单轮结果的组件。
-   `src/components/game-progress.tsx`: 显示游戏进度（轮次、分数）的组件。
-   `src/lib/game-utils.ts`: 用于计算分数和距离的工具函数。
-   `THIRD_PARTY_API_INTEGRATION.md`: 详细介绍第三方 API 集成的工作原理以及如何配置它。

## 第三方 API 集成

该项目已从 Firebase 迁移到第三方 API。有关详细的配置说明，请参阅 `THIRD_PARTY_API_INTEGRATION.md`。应用程序期望第三方 API 提供以下端点：

-   `GET /events?count={number}`: 获取历史事件。
-   `POST /events`: 提交一个新的历史事件。
-   `GET /locations?count={number}`: 获取经过验证的地理位置。
-   `POST /locations`: 提交一个新的地理位置。

所有 API 请求都使用 Bearer 令牌进行身份验证，该令牌通过 `NEXT_PUBLIC_API_KEY` 配置。

如果第三方 API 不可用，应用程序包含回退机制（例如，使用模拟数据）以确保基本功能。