import { NextResponse } from "next/server";
import { fetchVerifiedLocationsFromAPI, submitLocationToAPI } from "@/lib/data-service";

// 备用位置数据 - 当第三方API不可用时使用
const fallbackLocations = [
  { lat: 51.0447, lng: -114.0719 }, // Calgary downtown
  { lat: 51.0486, lng: -114.0708 }, // Calgary Tower area
  { lat: 51.0375, lng: -114.0812 }, // Stampede Park
  { lat: 51.0544, lng: -114.0625 }, // Kensington
  { lat: 51.0408, lng: -114.0581 }, // Inglewood
  { lat: 51.0458, lng: -114.0873 }, // Hillhurst
  { lat: 51.0392, lng: -114.0947 }, // Mission
  { lat: 51.0501, lng: -114.0532 }, // Bridgeland
  { lat: 51.0445, lng: -114.0625 }, // East Village
  { lat: 51.0478, lng: -114.0847 }  // Eau Claire
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');
    
    try {
      // 首先尝试从第三方API获取数据
      const locations = await fetchVerifiedLocationsFromAPI(count);
      return NextResponse.json(locations);
    } catch (apiError) {
      console.warn('Third-party API failed, using fallback locations:', apiError);
      
      // 如果第三方API失败，使用备用数据
      const shuffled = [...fallbackLocations].sort(() => 0.5 - Math.random());
      const selectedLocations = shuffled.slice(0, Math.min(count, fallbackLocations.length));
      
      return NextResponse.json(selectedLocations);
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证请求体包含必要的字段
    if (!body.lat || !body.lng) {
      return NextResponse.json({ 
        error: 'Missing required fields: lat and lng' 
      }, { status: 400 });
    }
    
    // 尝试向第三方API提交位置数据
    const result = await submitLocationToAPI(body);
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Location submitted successfully'
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to submit location to third-party API' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error submitting location:', error);
    return NextResponse.json({ error: 'Failed to submit location' }, { status: 500 });
  }
}