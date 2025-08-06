// lib/data-service.ts
// 数据服务层 - 用于调用第三方API获取数据

export interface TimeGuessrEvent {
  id: number;
  city: string;
  latitude: number;
  longitude: number;
  year: number;
  event_name: string;
  event_detail: string;
  event_description: string;
  image_prompt: string;
  image_url: string;
  created_at: string;
}

export interface Location {
  lat: number;
  lng: number;
}

// 第三方API配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-api-endpoint.com';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

/**
 * 从第三方API获取事件数据
 * @param count 需要获取的事件数量
 * @returns Promise<TimeGuessrEvent[]>
 */
export async function fetchEventsFromAPI(count: number = 5): Promise<TimeGuessrEvent[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events?count=${count}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        // 根据你的第三方API要求添加其他headers
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events from API:', error);
    // 如果API调用失败，返回空数组或抛出错误
    throw new Error('Failed to fetch events from third-party API');
  }
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
 * 向第三方API提交新的事件数据
 * @param eventData 事件数据
 * @returns Promise<{success: boolean, id?: number}>
 */
export async function submitEventToAPI(eventData: Omit<TimeGuessrEvent, 'id' | 'created_at'>): Promise<{success: boolean, id?: number}> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error submitting event to API:', error);
    return { success: false };
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