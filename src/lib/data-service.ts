// lib/data-service.ts
// 数据服务层 - 用于调用第三方API获取数据

// API返回的原始数据结构
export interface APIEventResponse {
  id: number;
  city: string;
  event_name: string;
  event_detail: string;
  event_descript: string; // 注意：API返回的字段名是 event_descript
  image_prompt: string;
  image_url: string;
  created_at: string;
}

// 应用内部使用的事件数据结构
export interface TimeGuessrEvent {
  id: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  year?: number;
  event_name: string;
  event_detail: string;
  event_description: string;
  image_prompt?: string;
  image_url: string;
  created_at?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

// 第三方API配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-api-endpoint.com';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

// 城市坐标映射（用于补充缺失的地理信息）
const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'Hong Kong': { latitude: 22.3193, longitude: 114.1694 },
  'Beijing': { latitude: 39.9042, longitude: 116.4074 },
  'Shanghai': { latitude: 31.2304, longitude: 121.4737 },
  'Shenzhen': { latitude: 22.3193, longitude: 114.1694 },
  'Hangzhou': { latitude: 30.2741, longitude: 120.1551 },
  'Paris': { latitude: 48.8566, longitude: 2.3522 },
  'London': { latitude: 51.5074, longitude: -0.1278 },
  'New York': { latitude: 40.7128, longitude: -74.0060 },
  'Tokyo': { latitude: 35.6762, longitude: 139.6503 },
  'Berlin': { latitude: 52.5200, longitude: 13.4050 },
  'Sydney': { latitude: -33.8688, longitude: 151.2093 },
  'Dubai': { latitude: 25.2048, longitude: 55.2708 },
  'Moscow': { latitude: 55.7558, longitude: 37.6176 },
  'Rome': { latitude: 41.9028, longitude: 12.4964 },
  'Madrid': { latitude: 40.4168, longitude: -3.7038 },
};

// 从事件名称和描述中提取年份的函数
function extractYearFromEvent(eventName: string, eventDetail: string, eventDescription: string): number {
  // 合并所有文本进行年份搜索
  const allText = `${eventName} ${eventDetail} ${eventDescription}`;
  
  // 尝试匹配四位数年份
  const yearMatch = allText.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return parseInt(yearMatch[0]);
  }
  
  // 尝试匹配年代表述（如1950s, 1960s等）
  const decadeMatch = allText.match(/\b(19|20)\d{1}0s\b/);
  if (decadeMatch) {
    const decade = parseInt(decadeMatch[0].replace('s', ''));
    return decade + 5; // 取年代中间值
  }
  
  // 特殊事件年份映射
  const eventYearMap: Record<string, number> = {
    'Double Tenth Riot': 1956,
    'Beijing Olympics': 2008,
    'Shanghai World Expo': 2010,
    // 可以根据需要添加更多特殊事件
  };
  
  for (const [event, year] of Object.entries(eventYearMap)) {
    if (allText.toLowerCase().includes(event.toLowerCase())) {
      return year;
    }
  }
  
  // 如果无法提取年份，返回默认值
  return 1950;
}

// 将API返回的数据转换为应用内部格式
export function transformAPIEventToTimeGuessrEvent(apiEvent: APIEventResponse): TimeGuessrEvent {
  const coordinates = CITY_COORDINATES[apiEvent.city] || { latitude: 0, longitude: 0 };
  const year = extractYearFromEvent(apiEvent.event_name, apiEvent.event_detail, apiEvent.event_descript);
  
  return {
    id: apiEvent.id,
    // city: apiEvent.city,
    // latitude: coordinates.latitude,
    // longitude: coordinates.longitude,
    // year: year,
    event_name: apiEvent.event_name,
    event_detail: apiEvent.event_detail,
    event_description: apiEvent.event_descript, // 映射字段名
    // image_prompt: apiEvent.image_prompt,
    image_url: apiEvent.image_url.trim().replace(/^`|`$/g, ''), // 移除可能的反引号
    // created_at: apiEvent.created_at
  };
}

/**
 * 从第三方API获取事件数据
 * @param count 需要获取的事件数量
 * @returns Promise<TimeGuessrEvent[]>
 */
export async function fetchEventsFromAPI(count: number = 5): Promise<TimeGuessrEvent[]> {
  try {
    // 直接使用相对路径调用API
    const response = await fetch(`/api/events?count=${count}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // 检查返回的数据结构
    let apiData: APIEventResponse[];
    if (Array.isArray(responseData)) {
      apiData = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      apiData = responseData.data;
    } else if (responseData.events && Array.isArray(responseData.events)) {
      apiData = responseData.events;
    } else {
      // 如果是单个对象，转换为数组
      apiData = [responseData];
    }
    
    // 将API返回的数据转换为应用内部格式
    const transformedData = apiData.map(transformAPIEventToTimeGuessrEvent);
    return transformedData;
  } catch (error) {
    console.error('Error fetching events from API:', error);
    // 如果API调用失败，返回模拟数据用于测试
    return getMockEvents(count);
  }
}

// 模拟数据函数
function getMockEvents(count: number): TimeGuessrEvent[] {
  const mockEvents: TimeGuessrEvent[] = [
    {
      id: 1,
      city: "北京",
      latitude: 39.9042,
      longitude: 116.4074,
      year: 2008,
      event_name: "北京奥运会开幕式",
      event_detail: "第29届夏季奥林匹克运动会开幕式在北京国家体育场举行",
      event_description: "这是一场盛大的体育盛会，展现了中国的文化和现代化成就",
      image_prompt: "Beijing Olympics opening ceremony",
      image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      city: "上海",
      latitude: 31.2304,
      longitude: 121.4737,
      year: 2010,
      event_name: "上海世博会",
      event_detail: "中国2010年上海世界博览会在上海举办",
      event_description: "以'城市，让生活更美好'为主题的世界博览会",
      image_prompt: "Shanghai World Expo",
      image_url: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=800&h=600&fit=crop",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 3,
      city: "深圳",
      latitude: 22.3193,
      longitude: 114.1694,
      year: 1980,
      event_name: "深圳经济特区成立",
      event_detail: "深圳经济特区正式成立，成为中国改革开放的窗口",
      event_description: "标志着中国改革开放政策的重要里程碑",
      image_prompt: "Shenzhen Special Economic Zone",
      image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 4,
      city: "香港",
      latitude: 22.3193,
      longitude: 114.1694,
      year: 1997,
      event_name: "香港回归",
      event_detail: "香港主权移交仪式在香港会议展览中心举行",
      event_description: "标志着香港结束英国统治，回归中华人民共和国",
      image_prompt: "Hong Kong handover ceremony",
      image_url: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&h=600&fit=crop",
      created_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 5,
      city: "杭州",
      latitude: 30.2741,
      longitude: 120.1551,
      year: 2016,
      event_name: "G20杭州峰会",
      event_detail: "二十国集团领导人第十一次峰会在杭州举行",
      event_description: "展现了杭州的美丽风光和中国的外交实力",
      image_prompt: "G20 Hangzhou Summit",
      image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
      created_at: "2024-01-01T00:00:00Z"
    }
  ];
  
  return mockEvents.slice(0, count);
}

/**
 * 从第三方API获取验证过的位置数据
 * @param count 需要获取的位置数量
 * @returns Promise<Location[]>
 */
export async function fetchVerifiedLocationsFromAPI(count: number = 10): Promise<Location[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/locations?count=${count}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching locations from API:', error);
    throw new Error('Failed to fetch locations from third-party API');
  }
}

/**
 * 直接调用第三方游戏API - 开始游戏
 */
export async function startGameDirect(request: {
  gameMode: 'timed' | 'untimed';
  questionCount: number;
  timeLimit?: number;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
}

/**
 * 直接调用第三方游戏API - 提交答案
 */
export async function submitAnswerDirect(request: {
  gameSessionId: string;
  eventId: string;
  guessedYear: number;
  guessedLocation?: { lat: number; lng: number; };
  answerTime?: number;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
}

/**
 * 向第三方API提交新的位置数据
 * @param location 位置数据
 * @returns Promise<{success: boolean}>
 */
export async function submitLocationToAPI(location: Location): Promise<{success: boolean}> {
  try {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting location to API:', error);
    return { success: false };
  }
}

/**
 * 用户猜测数据接口
 */
export interface UserGuess {
  eventId: number;
  guessedLat: number;
  guessedLng: number;
  guessedYear: number;
  answerTime: number; // 用户回答问题所用的时间（毫秒）
  gameMode: 'timed' | 'untimed';
}

/**
 * 验证结果接口
 */
export interface VerificationResult {
  success: boolean;
  score: number;
  distance: number;
  yearDifference: number;
  actualLat: number;
  actualLng: number;
  actualYear: number;
  message?: string;
}

/**
 * 向后台提交用户猜测并获取验证结果
 * @param guess 用户猜测数据
 * @returns Promise<VerificationResult>
 */
export async function submitGuessToAPI(guess: UserGuess): Promise<VerificationResult> {
  try {
    // 直接调用第三方接口 /game/submit
    const response = await fetch(`${API_BASE_URL}/game/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(guess),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting guess to API:', error);
    return {
      success: false,
      score: 0,
      distance: 0,
      yearDifference: 0,
      actualLat: 0,
      actualLng: 0,
      actualYear: 0,
      message: 'Failed to verify guess'
    };
  }
}
