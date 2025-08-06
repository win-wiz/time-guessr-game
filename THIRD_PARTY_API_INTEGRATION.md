# 第三方API集成指南

本项目已从Firebase数据存储迁移到第三方API集成。本文档说明如何配置和使用新的数据服务。

## 概述

项目现在通过第三方API获取以下数据：
- 游戏事件数据（历史事件信息）
- 验证过的地理位置数据

## 配置步骤

### 1. 环境变量配置

复制 `.env.example` 文件为 `.env.local` 并配置以下变量：

```bash
# 第三方API配置
NEXT_PUBLIC_API_BASE_URL=https://your-third-party-api.com/api
NEXT_PUBLIC_API_KEY=your_api_key_here
```

### 2. API端点要求

你的第三方API需要提供以下端点：

#### 获取事件数据
```
GET /events?count={number}
```

响应格式：
```json
[
  {
    "id": 1,
    "city": "城市名称",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "year": 1989,
    "event_name": "事件名称",
    "event_detail": "事件详情",
    "event_description": "事件描述",
    "image_prompt": "图片提示",
    "image_url": "图片URL",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### 提交事件数据
```
POST /events
```

请求体格式：
```json
{
  "city": "城市名称",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "year": 1989,
  "event_name": "事件名称",
  "event_detail": "事件详情",
  "event_description": "事件描述",
  "image_prompt": "图片提示",
  "image_url": "图片URL"
}
```

#### 获取位置数据
```
GET /locations?count={number}
```

响应格式：
```json
[
  {
    "lat": 51.0447,
    "lng": -114.0719
  }
]
```

#### 提交位置数据
```
POST /locations
```

请求体格式：
```json
{
  "lat": 51.0447,
  "lng": -114.0719
}
```

### 3. 认证配置

所有API请求都会包含以下headers：
```
Content-Type: application/json
Authorization: Bearer {API_KEY}
```

如果你的API使用不同的认证方式，请修改 `src/lib/data-service.ts` 中的headers配置。

## 备用机制

项目包含备用机制以确保在第三方API不可用时仍能正常运行：

1. **事件数据备用**：如果API调用失败，系统会使用预定义的模拟事件数据
2. **位置数据备用**：如果API调用失败，系统会生成Calgary地区的随机位置

## 文件结构

```
src/
├── lib/
│   ├── data-service.ts          # 第三方API服务层
│   ├── location-generator.ts    # 位置生成器（已更新）
│   └── firebase.ts              # Firebase配置（可选保留）
├── app/
│   ├── api/
│   │   ├── events/route.ts      # 事件API路由
│   │   └── locations/route.ts   # 位置API路由
│   └── game/page.tsx            # 游戏页面（已更新）
└── ...
```

## 主要变更

1. **新增文件**：
   - `src/lib/data-service.ts` - 第三方API集成服务
   - `src/app/api/locations/route.ts` - 位置数据API路由
   - `.env.example` - 环境变量示例

2. **修改文件**：
   - `src/app/api/events/route.ts` - 使用第三方API获取事件数据
   - `src/lib/location-generator.ts` - 使用第三方API获取位置数据
   - `src/app/game/page.tsx` - 更新类型导入

3. **Firebase依赖**：
   - Firebase相关代码已被替换，但配置文件保留以备其他功能使用

## 测试

启动开发服务器后，游戏将自动尝试从第三方API获取数据。如果API不可用，将使用备用数据确保游戏正常运行。

```bash
npm run dev
```

访问 `http://localhost:3000/game` 测试游戏功能。

## 故障排除

1. **API调用失败**：检查控制台日志，确认API_BASE_URL和API_KEY配置正确
2. **认证错误**：确认API密钥有效且具有正确权限
3. **数据格式错误**：确认第三方API返回的数据格式符合预期

## 扩展

如需添加更多数据类型或API端点，请：
1. 在 `data-service.ts` 中添加新的函数
2. 创建相应的API路由
3. 更新类型定义
4. 添加备用数据机制