import { NextResponse } from "next/server";
// import { transformAPIEventToTimeGuessrEvent, APIEventResponse } from "@/lib/data-service";
import { baseURL } from "@/lib/utils";

export const runtime = 'edge';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json({ error: 'Missing required parameter: eventId' }, { status: 400 });
    }
    
    if (!baseURL) {
      console.error('NEXT_PUBLIC_API_BASE_URL 环境变量未配置');
      return NextResponse.json({
        success: false,
        error: 'API base URL not configured',
      }, { status: 500 });
    }
    
    const response = await fetch(`${baseURL}/events/${eventId}`);
    
    if (!response.ok) {
      console.error(`第三方API返回错误状态: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        success: false,
        error: `Third-party API error: ${response.status}`,
      }, { status: response.status });
    }
    
    const eventData = await response.json();
    console.log('获取事件信息成功:', eventData);
    
    return NextResponse.json({
      success: true,
      data: eventData
    });
      
  } catch (error) {
    console.error('API路由错误:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch events' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 尝试向第三方API提交数据
    // const result = await submitEventToAPI(body);
    
    // if (result.success) {
      return NextResponse.json({ 
        message: 'Event created successfully', 
        id: 1 
      });
    // } else {
    //   return NextResponse.json({ 
    //     error: 'Failed to submit event to third-party API' 
    //   }, { status: 500 });
    // }
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}