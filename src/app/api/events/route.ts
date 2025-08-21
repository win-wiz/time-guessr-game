import { NextResponse } from "next/server";
import { transformAPIEventToTimeGuessrEvent, APIEventResponse } from "@/lib/data-service";
import { baseURL } from "@/lib/utils";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json({ error: 'Missing required parameter: eventId' }, { status: 400 });
    }
    
    const transformedEvents = await fetch(`${baseURL}/events/${eventId}`);
    
    try {
      
       console.log('获取事件信息====》》', transformedEvents.json());
       return NextResponse.json(transformedEvents);
      
    } catch (apiError) {
      console.warn('第三方API调用失败，使用备用数据:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch events from API',
      });
    }
  } catch (error) {
    console.error('API路由错误:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
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