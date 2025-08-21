// API层性能优化策略

import { NextRequest, NextResponse } from 'next/server';

// 1. 请求缓存优化
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCachedResponse(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCachedResponse(key: string, data: any, ttlMs: number = 300000) { // 5分钟默认缓存
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

// 2. 请求合并优化
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }
  
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}

// 3. 批量请求优化
export async function batchAPIRequests<T>(
  requests: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(req => req()));
    results.push(...batchResults);
  }
  
  return results;
}

// 4. 优化后的API路由示例
export async function optimizedGameStartAPI(request: NextRequest) {
  const body = await request.json();
  const cacheKey = `game_start_${JSON.stringify(body)}`;
  
  // 1. 检查缓存
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // 2. 请求去重
  const result = await deduplicateRequest(cacheKey, async () => {
    // 实际的第三方API调用
    const response = await fetch(`${process.env.THIRD_PARTY_API_URL}/game/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.THIRD_PARTY_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    
    return response.json();
  });
  
  // 3. 缓存结果
  setCachedResponse(cacheKey, result, 60000); // 1分钟缓存
  
  return NextResponse.json(result);
}

// 5. 连接池优化（Node.js环境）
import { Agent } from 'https';

const httpsAgent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
});

export const optimizedFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    // @ts-ignore
    agent: httpsAgent
  });
};