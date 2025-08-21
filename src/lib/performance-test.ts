// 性能测试工具 - 比较直接调用 vs API层调用的性能差异

interface PerformanceResult {
  method: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
  totalRequests: number;
}

// 直接调用第三方API的性能测试
export async function testDirectAPICall(iterations: number = 10): Promise<PerformanceResult> {
  const times: number[] = [];
  let successCount = 0;
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      // 模拟直接调用第三方API
      const response = await fetch('https://third-party-api.com/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
        },
        body: JSON.stringify({
          gameMode: 'timed',
          questionCount: 5,
          timeLimit: 120
        })
      });
      
      if (response.ok) {
        successCount++;
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      const endTime = performance.now();
      times.push(endTime - startTime);
    }
  }
  
  return {
    method: 'Direct API Call',
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    successRate: (successCount / iterations) * 100,
    totalRequests: iterations
  };
}

// 通过API层调用的性能测试
export async function testAPILayerCall(iterations: number = 10): Promise<PerformanceResult> {
  const times: number[] = [];
  let successCount = 0;
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      // 通过自己的API层调用
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameMode: 'timed',
          questionCount: 5,
          timeLimit: 120
        })
      });
      
      if (response.ok) {
        successCount++;
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      const endTime = performance.now();
      times.push(endTime - startTime);
    }
  }
  
  return {
    method: 'API Layer Call',
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    successRate: (successCount / iterations) * 100,
    totalRequests: iterations
  };
}

// 并行性能测试
export async function runPerformanceComparison(): Promise<{
  direct: PerformanceResult;
  apiLayer: PerformanceResult;
  analysis: string;
}> {
  console.log('开始性能测试...');
  
  const [directResult, apiLayerResult] = await Promise.all([
    testDirectAPICall(20),
    testAPILayerCall(20)
  ]);
  
  const timeDifference = apiLayerResult.averageTime - directResult.averageTime;
  const percentageDifference = ((timeDifference / directResult.averageTime) * 100).toFixed(1);
  
  const analysis = `
性能分析结果：
- 直接调用平均延迟: ${directResult.averageTime.toFixed(2)}ms
- API层调用平均延迟: ${apiLayerResult.averageTime.toFixed(2)}ms
- 延迟增加: ${timeDifference.toFixed(2)}ms (${percentageDifference}%)
- 成功率对比: 直接调用 ${directResult.successRate}% vs API层 ${apiLayerResult.successRate}%

结论: ${
  Math.abs(parseFloat(percentageDifference)) < 20 
    ? 'API层的性能开销可以接受，建议优先考虑安全性和可维护性'
    : 'API层有明显性能开销，需要根据具体需求权衡'
}`;
  
  return {
    direct: directResult,
    apiLayer: apiLayerResult,
    analysis
  };
}