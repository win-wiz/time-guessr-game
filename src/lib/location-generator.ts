// lib/location-generator.ts

import { hasStreetView } from "@/lib/streetview";
import { fetchVerifiedLocationsFromAPI, submitLocationToAPI, Location } from "@/lib/data-service";

const CALGARY_BOUNDS = {
  north: 51.054582, // Northeast corner 51.054582, -114.053253
  south: 51.036649, // Southwest corner 51.036649, -114.094705
  west: -114.094705, // Northwest corner 51.056375, -114.094705
  east: -114.050461, // Southeast corner 51.035962, -114.050461
};

// Location接口已在data-service.ts中定义

export async function generateRandomLocation(): Promise<Location> {
  const lat =
    Math.random() * (CALGARY_BOUNDS.north - CALGARY_BOUNDS.south) +
    CALGARY_BOUNDS.south;
  const lng =
    Math.random() * (CALGARY_BOUNDS.east - CALGARY_BOUNDS.west) +
    CALGARY_BOUNDS.west;
  return { lat, lng };
}

export async function validateStreetView(location: Location): Promise<boolean> {
  return await hasStreetView(location.lat, location.lng);
}

export async function getVerifiedLocations(count = 10): Promise<Location[]> {
  try {
    // 首先尝试从第三方API获取验证过的位置
    const locations = await fetchVerifiedLocationsFromAPI(count);
    
    if (locations.length >= count) {
      // 随机选择指定数量的位置
      const shuffled = locations.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
    
    // 如果API返回的位置不够，生成更多位置
    const selected = [...locations];
    while (selected.length < count) {
      const candidate = await generateRandomLocation();
      const isValid = await validateStreetView(candidate);
      if (isValid) {
        // 向第三方API提交新的验证位置
        await submitLocationToAPI(candidate);
        selected.push(candidate);
      }
    }
    
    return selected;
  } catch (error) {
    console.error('Error fetching locations from API, generating fallback locations:', error);
    
    // 如果第三方API失败，生成备用位置
    const fallbackLocations: Location[] = [];
    while (fallbackLocations.length < count) {
      const candidate = await generateRandomLocation();
      const isValid = await validateStreetView(candidate);
      if (isValid) {
        fallbackLocations.push(candidate);
      }
    }
    
    return fallbackLocations;
  }
}
