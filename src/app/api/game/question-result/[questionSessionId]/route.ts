import { NextRequest, NextResponse } from 'next/server';
import { API_KEY, baseURL } from '@/lib/utils';

interface QuestionResultResponse {
  success: boolean;
  data?: {
    questionSessionId: string;
    gameSessionId: string;
    questionNumber: number;
    eventId: string;
    guessedYear: number;
    actualYear: number;
    guessedLocation: {
      lat: number;
      lng: number;
    };
    actualLocation: {
      lat: number;
      lng: number;
    };
    answerTime: number;
    score: number;
    scoringDetails: {
      timeScore: number;
      locationScore: number;
      bonusScore: number;
      finalScore: number;
      rank: string;
      achievements: string[];
      streak: number;
      speedBonus: number;
      perfectBonus: number;
      streakBonus: number;
      gameMode: string;
      timeAccuracy: string;
      locationAccuracy: string;
    };
    status: 'completed';
  };
  error?: {
    type: string;
    message: string;
    code?: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { questionSessionId: string } }
) {
  try {
    const { questionSessionId } = await params;
    
    if (!questionSessionId) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'questionSessionId is required',
          code: 400
        }
      }, { status: 400 });
    }

    console.log(`获取题目结果，questionSessionId: ${questionSessionId}`);

    // 调用第三方API获取题目结果
    const thirdPartyResponse = await fetch(`${baseURL}/game/question-result/${questionSessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!thirdPartyResponse.ok) {
      if (thirdPartyResponse.status === 404) {
        return NextResponse.json({
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: `未找到ID为 ${questionSessionId} 的题目结果`,
            code: 404
          }
        }, { status: 404 });
      }

      throw new Error(`第三方API请求失败: ${thirdPartyResponse.status} ${thirdPartyResponse.statusText}`);
    }

    const thirdPartyData = await thirdPartyResponse.json();
    
    console.log('第三方API返回的题目结果数据:', JSON.stringify(thirdPartyData, null, 2));
    
    // 处理第三方API返回的数据格式
    let questionResultData;
    if (thirdPartyData.success && thirdPartyData.data) {
      questionResultData = thirdPartyData.data;
    } else {
      throw new Error('无效的API响应格式');
    }

    // 返回标准化的题目结果，确保事件信息在 event 字段中
    if (questionResultData.eventDetail) {
      questionResultData.event = questionResultData.eventDetail;
      delete questionResultData.eventDetail;
    }
    
    return NextResponse.json({
      success: true,
      data: questionResultData
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error getting question result:', error);
    return NextResponse.json({
      success: false,
      error: {
        type: 'API_ERROR',
        message: '获取题目结果时发生错误',
        code: 500
      }
    }, { status: 500 });
  }
}
