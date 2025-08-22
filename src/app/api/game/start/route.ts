import { baseURL } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
interface StartGameRequest {
  gameMode: 'timed' | 'untimed';
  questionCount: number;
  timeLimit?: number;
}

interface StartGameResponse {
  success: boolean;
  data: {
    gameSessionId: string;
    eventIds: string[];
    currentQuestion: number;
    totalQuestions: number;
    gameMode: string;
    timeLimit?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: StartGameRequest = await request.json();
    
    console.log('Start game request received：', body);

    // 验证请求参数
    if (!body.gameMode || !body.questionCount) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Missing required fields: gameMode and questionCount',
        }
      }, { status: 400 });
    }

    if (body.questionCount < 1 || body.questionCount > 20) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'questionCount must be between 1 and 20',
        }
      }, { status: 400 });
    }

    if (body.gameMode === 'timed' && !body.timeLimit) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'timeLimit is required for timed mode',
        }
      }, { status: 400 });
    }

    // 生成游戏会话ID: 使用随机种子 
    // const gameSessionId = `game_${nanoid(12)}`;
    
    // // 生成事件ID列表（这里使用模拟数据，实际应该从数据库获取）
    // const eventIds = Array.from({ length: body.questionCount }, (_, i) => String(i + 1));

    // 调用第三方游戏API - 开始游戏
    const gameStartsResponse = await fetch(`${baseURL}/game/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('API response received：', gameStartsResponse);
    
    if (!gameStartsResponse.ok) {
      throw new Error(`API request failed: ${gameStartsResponse.status} ${gameStartsResponse.statusText}`);
    }

    const gameStartsResult = await gameStartsResponse.json();
    
    // 获取游戏会话ID和事件ID列表
    const { gameSessionId, eventIds } = gameStartsResult.data; 
    
    const response: StartGameResponse = {
      success: true,
      data: {
        gameSessionId,
        eventIds,
        currentQuestion: 1,
        totalQuestions: body.questionCount,
        gameMode: body.gameMode,
        timeLimit: body.timeLimit
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({
      success: false,
      error: {
        type: 'DATABASE_ERROR',
        message: 'Failed to start game',
      }
    }, { status: 500 });
  }
}