"use client";

import { useEffect, useState } from "react";

export default function EnvTest() {
  const [apiKey, setApiKey] = useState<string | undefined>("");
  
  useEffect(() => {
    // 在客户端渲染时获取环境变量
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">环境变量测试</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Google Maps API 密钥:</h2>
        <div className="font-mono bg-white p-2 border rounded">
          {apiKey ? apiKey : "未设置"}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          密钥状态: {apiKey ? "✅ 已设置" : "❌ 未设置"}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">环境变量调试信息:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>NEXT_PUBLIC_ 前缀的环境变量可以在客户端访问</li>
          <li>环境变量在构建时被注入，修改后需要重启开发服务器</li>
          <li>优先级: .env.local > .env.development > .env</li>
        </ul>
      </div>
    </div>
  );
}