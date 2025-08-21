# Google Maps API 设置指南

本项目使用 Google Maps API 来显示地图和位置信息。请按照以下步骤设置 Google Maps API：

## 获取 Google Maps API 密钥

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建一个新项目或选择现有项目
3. 在左侧菜单中，点击 "API 和服务" > "库"
4. 搜索并启用以下 API：
   - Maps JavaScript API
   - Geocoding API
   - Places API（如果需要）
5. 在左侧菜单中，点击 "API 和服务" > "凭据"
6. 点击 "创建凭据" > "API 密钥"
7. 复制生成的 API 密钥

## 配置项目

1. 在项目根目录创建 `.env.local` 文件（如果不存在）
2. 添加以下环境变量：
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
3. 将 `YOUR_API_KEY_HERE` 替换为您刚刚获取的 API 密钥
4. 重启开发服务器以应用更改

## 限制 API 密钥（推荐）

为了安全起见，建议限制您的 API 密钥：

1. 在 Google Cloud Console 中，转到 "API 和服务" > "凭据"
2. 点击您的 API 密钥
3. 在 "应用程序限制" 下，选择 "HTTP 引用站点"
4. 添加您的网站域名（例如 `https://your-domain.com/*`）
5. 在 "API 限制" 下，限制密钥只能用于您需要的 API
6. 点击 "保存" 应用更改

## 故障排除

如果地图无法正常显示，请检查：

1. 确保 API 密钥正确无误
2. 确保已启用所需的 API
3. 检查浏览器控制台是否有错误消息
4. 确认 API 密钥的限制不会阻止您的网站使用它

## 相关资源

- [Google Maps JavaScript API 文档](https://developers.google.com/maps/documentation/javascript)
- [@react-google-maps/api 文档](https://react-google-maps-api-docs.netlify.app/)