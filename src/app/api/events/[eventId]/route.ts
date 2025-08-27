import { NextRequest, NextResponse } from 'next/server'; 
import { API_KEY, baseURL } from '@/lib/utils';

export const runtime = 'edge';
// 事件详情响应接口
interface EventDetailResponse {
  success: boolean;
  data?: {
    id: string;
    description?: string;
    detail?: string;
    imageUrl?: string;
    difficulty?: string;
  };
  error?: {
    type: string;
    message: string;
    code?: number;
  };
}

// GET /api/events/[eventId] - 获取单个事件详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<NextResponse<EventDetailResponse>> {
  try {
    // 获取 [eventId] 参数
    const { eventId } = await params;
    // 验证eventId参数
    if (!eventId) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: '事件ID不能为空',
          code: 400
        }
      }, { status: 400 });
    }

    console.log('eventId==========>>>>>:', eventId, '\n\n');

    if (!baseURL) {
      console.error('NEXT_PUBLIC_API_BASE_URL 环境变量未配置');
      return NextResponse.json({
        success: false,
        error: {
          type: 'CONFIGURATION_ERROR',
          message: 'API base URL not configured',
          code: 500
        }
      }, { status: 500 });
    }

    // 调用第三方API获取事件详情
    const thirdPartyResponse = await fetch(`${baseURL}/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    // console.log('Third-party API response:', thirdPartyResponse);
    if (!thirdPartyResponse.ok) {
      if (thirdPartyResponse.status === 404) {
        return NextResponse.json({
          success: false,
          error: {
            type: 'NOT_FOUND',
            message: `未找到ID为 ${eventId} 的事件`,
            code: 404
          }
        }, { status: 404 });
      }

      throw new Error(`Third-party API request failed: ${thirdPartyResponse.status} ${thirdPartyResponse.statusText}`);
    }

    const thirdPartyData = await thirdPartyResponse.json();
    
    // console.log('第三方API返回的数据格式：', JSON.stringify(thirdPartyData, null, 2));
    
    // 处理第三方API返回的数据格式
    // 根据实际返回格式: { success: true, data: event, timestamp: ... }
    let eventData;
    if (thirdPartyData.success && thirdPartyData.data) {
      eventData = thirdPartyData.data;
    } else {
      throw new Error('Invalid API response format');
    }

    

    // 转换为标准格式，根据实际数据结构映射
    const standardizedEvent = {
      id: String(eventData.id || eventId),
      description: eventData.event_name || eventData.event_detail || '',
      detail: eventData.event_detail || '',
      imageUrl: eventData.image_url || '',
      difficulty: eventData.difficulty || 'medium'
    };

    console.log('Standardized event:', JSON.stringify(standardizedEvent, null, 2));

    // 返回标准化的事件详情
    return NextResponse.json({
      success: true,
      data: standardizedEvent
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error fetching event detail from third-party API:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        type: 'INTERNAL_ERROR',
        message: '获取事件详情时发生内部错误',
        code: 500
      }
    }, { status: 500 });
  }
}
