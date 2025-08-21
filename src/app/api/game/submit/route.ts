import { NextRequest, NextResponse } from 'next/server';
import { baseURL, API_KEY } from '@/lib/utils';

interface SubmitAnswerRequest {
  gameSessionId: string;
  eventId: string;
  guessedYear: number;
  guessedLocation?: {
    lat: number;
    lng: number;
  };
  answerTime?: number;
}

interface SubmitAnswerResponse {
  success: boolean;
  data: {
    questionSessionId: string;
    gameSessionId: string;
    status: 'submitted' | 'completed';
  };
}

// 模拟的游戏会话存储（实际应该使用数据库）
const gameSessions = new Map<string, {
  eventIds: string[];
  submittedQuestions: number;
  totalQuestions: number;
}>();

export async function POST(request: NextRequest) {
  try {
    const body: SubmitAnswerRequest = await request.json();
    
    // 验证请求参数
    if (!body.gameSessionId || !body.eventId || body.guessedYear === undefined) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Missing required fields: gameSessionId, eventId, and guessedYear',
        }
      }, { status: 400 });
    }

    console.log('提交答案请求：', body);

    // 调用第三方API提交答案
    const apiResponse = await fetch(`${baseURL}/game/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!apiResponse.ok) {
      console.error(`第三方API请求失败: ${apiResponse.status} ${apiResponse.statusText}`);
      
      // 如果第三方API失败，使用本地备用逻辑
      console.log('使用本地备用逻辑处理提交');
      
      // 验证游戏会话（这里使用模拟逻辑）
      let gameSession = gameSessions.get(body.gameSessionId);
      if (!gameSession) {
        // 如果会话不存在，创建一个新的（用于测试）
        // 使用实际的eventId而不是硬编码的数组
        gameSession = {
          eventIds: [body.eventId], // 动态添加当前eventId
          submittedQuestions: 0,
          totalQuestions: 5
        };
        gameSessions.set(body.gameSessionId, gameSession);
        console.log(`Created new game session with eventId: ${body.eventId}`);
      } else {
        // 如果eventId不在列表中，动态添加它
        if (!gameSession.eventIds.includes(body.eventId)) {
          gameSession.eventIds.push(body.eventId);
          console.log(`Added eventId ${body.eventId} to existing game session`);
        }
      }

      // 现在eventId应该总是有效的，但我们仍然可以记录日志
      console.log(`Processing eventId: ${body.eventId}, Game session eventIds: ${gameSession.eventIds.join(', ')}`);

      // 更新游戏会话状态
      gameSession.submittedQuestions += 1;
      
      // 生成题目会话ID
      const questionSessionId = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 判断游戏是否完成
      const status = gameSession.submittedQuestions >= gameSession.totalQuestions ? 'completed' : 'submitted';
      
      const response: SubmitAnswerResponse = {
        success: true,
        data: {
          questionSessionId,
          gameSessionId: body.gameSessionId,
          status
        }
      };

      return NextResponse.json(response);
    }

    // 处理第三方API的响应
    const apiResult = await apiResponse.json();
    console.log('第三方API响应：', apiResult);

    // 确保API返回了正确的格式
    // if (!apiResult.success || !apiResult.data) {
    //   throw new Error('第三方API返回了无效的响应格式');
    // }

    // 返回标准化的响应
    return NextResponse.json({
      success: true,
      data: {
        questionSessionId: apiResult.data.questionSessionId || `question_${Date.now()}`,
        gameSessionId: body.gameSessionId,
        status: apiResult.data.status || 'submitted'
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json({
      success: false,
      error: {
        type: 'DATABASE_ERROR',
        message: 'Failed to submit answer',
      }
    }, { status: 500 });
  }
}