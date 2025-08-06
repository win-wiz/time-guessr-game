import { NextResponse } from "next/server";
import { fetchEventsFromAPI, submitEventToAPI } from "@/lib/data-service";

// 备用模拟数据 - 当第三方API不可用时使用
const fallbackEvents = [
  {
    id: 1,
    city: "北京",
    latitude: 39.9042,
    longitude: 116.4074,
    year: 1989,
    event_name: "天安门事件",
    event_detail: "1989年春夏之交的政治风波",
    event_description: "学生聚集在广场上进行抗议活动",
    image_prompt: "A large public square with traditional Chinese architecture, students gathering peacefully",
    image_url: "https://example.com/tiananmen.jpg",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    city: "柏林",
    latitude: 52.5200,
    longitude: 13.4050,
    year: 1989,
    event_name: "柏林墙倒塌",
    event_detail: "东西德统一的象征性事件",
    event_description: "人们用锤子敲击混凝土墙",
    image_prompt: "People with hammers breaking down a concrete wall, celebration atmosphere",
    image_url: "https://example.com/berlin-wall.jpg",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    city: "纽约",
    latitude: 40.7589,
    longitude: -73.9851,
    year: 2001,
    event_name: "911事件",
    event_detail: "世贸中心遭受恐怖袭击",
    event_description: "高楼大厦冒出浓烟，人们在街道上奔跑",
    image_prompt: "Urban skyline with tall buildings, smoke in the distance, people on busy streets",
    image_url: "https://example.com/wtc.jpg",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    city: "伦敦",
    latitude: 51.5074,
    longitude: -0.1278,
    year: 2012,
    event_name: "伦敦奥运会",
    event_detail: "第30届夏季奥林匹克运动会",
    event_description: "体育场内举行盛大的开幕式",
    image_prompt: "Large stadium with Olympic rings, colorful ceremony, crowds cheering",
    image_url: "https://example.com/london-olympics.jpg",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: 5,
    city: "东京",
    latitude: 35.6762,
    longitude: 139.6503,
    year: 2011,
    event_name: "东日本大地震",
    event_detail: "9.0级大地震引发海啸",
    event_description: "城市街道出现裂缝，建筑物摇摆",
    image_prompt: "Urban street with cracks, buildings swaying, emergency vehicles",
    image_url: "https://example.com/japan-earthquake.jpg",
    created_at: "2024-01-01T00:00:00Z"
  }
];

export async function GET(request: Request) {
  try {
    debugger
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '5');
    debugger
    try {
      // 首先尝试从第三方API获取数据
      const events = await fetchEventsFromAPI(count);
      console.log('Fetched events from API:', events);
      return NextResponse.json(events);
    } catch (apiError) {
      console.warn('Third-party API failed, using fallback data:', apiError);
      
      // 如果第三方API失败，使用备用数据
      const shuffled = [...fallbackEvents].sort(() => 0.5 - Math.random());
      const selectedEvents = shuffled.slice(0, Math.min(count, fallbackEvents.length));
      
      return NextResponse.json(selectedEvents);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 尝试向第三方API提交数据
    const result = await submitEventToAPI(body);
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Event created successfully', 
        id: result.id || Date.now() 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to submit event to third-party API' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}