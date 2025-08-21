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
        gameSession = {
          eventIds: ['1', '2', '3', '4', '5'],
          submittedQuestions: 0,
          totalQuestions: 5
        };
        gameSessions.set(body.gameSessionId, gameSession);
      }

      // 验证事件ID是否在当前游戏中
      if (!gameSession.eventIds.includes(body.eventId)) {
        return NextResponse.json({
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'Invalid eventId for this game session',
          }
        }, { status: 400 });
      }

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