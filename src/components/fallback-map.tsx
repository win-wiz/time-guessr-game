'use client'

import { useState } from 'react'

interface FallbackMapProps {
  onMapClick?: (lat: number, lng: number) => void;
  guessLocation: { lat: number; lng: number } | null;
  actualLocation: { lat: number; lng: number } | null;
  isGuessing: boolean;
}

export function FallbackMap({
  onMapClick,
  guessLocation,
  actualLocation,
  isGuessing,
}: FallbackMapProps) {
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isGuessing || !onMapClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 将点击位置转换为卡尔加里地区的大致坐标
    const lat = 51.2 - (y / rect.height) * 0.4; // 卡尔加里纬度范围
    const lng = -114.5 + (x / rect.width) * 0.8; // 卡尔加里经度范围
    
    setClickPosition({ x, y });
    onMapClick(lat, lng);
  };

  const getMarkerPosition = (lat: number, lng: number) => {
    // 将经纬度转换为像素位置
    const x = ((lng + 114.5) / 0.8) * 100; // 转换为百分比
    const y = ((51.2 - lat) / 0.4) * 100; // 转换为百分比
    return { x: `${Math.max(0, Math.min(100, x))}%`, y: `${Math.max(0, Math.min(100, y))}%` };
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden border-2 border-gray-300">
      {/* 地图背景 */}
      <div 
        className={`w-full h-full relative ${isGuessing ? 'cursor-crosshair' : 'cursor-default'}`}
        onClick={handleMapClick}
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            linear-gradient(45deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%'
        }}
      >
        {/* 网格线 */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 10}%` }} />
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 10}%` }} />
          ))}
        </div>

        {/* 城市标记 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <div className="text-xs text-gray-700 mt-1 whitespace-nowrap">卡尔加里</div>
        </div>

        {/* 猜测位置标记 */}
        {guessLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: getMarkerPosition(guessLocation.lat, guessLocation.lng).x,
              top: getMarkerPosition(guessLocation.lat, guessLocation.lng).y
            }}
          >
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="text-xs text-red-600 mt-1 whitespace-nowrap font-bold">Your Guess</div>
          </div>
        )}

        {/* 实际位置标记 */}
        {actualLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: getMarkerPosition(actualLocation.lat, actualLocation.lng).x,
              top: getMarkerPosition(actualLocation.lat, actualLocation.lng).y
            }}
          >
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="text-xs text-green-600 mt-1 whitespace-nowrap font-bold">Actual Location</div>
          </div>
        )}

        {/* 连接线 */}
        {guessLocation && actualLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={getMarkerPosition(guessLocation.lat, guessLocation.lng).x}
              y1={getMarkerPosition(guessLocation.lat, guessLocation.lng).y}
              x2={getMarkerPosition(actualLocation.lat, actualLocation.lng).x}
              y2={getMarkerPosition(actualLocation.lat, actualLocation.lng).y}
              stroke="#000"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          </svg>
        )}

        {/* 提示文字 */}
        {isGuessing && (
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded-lg shadow-lg">
            <p className="text-sm text-gray-700">Click on the map to make a guess</p>
          </div>
        )}
      </div>

      {/* API Key 提示 */}
      <div className="absolute bottom-4 right-4 bg-yellow-100 border border-yellow-300 px-3 py-2 rounded-lg text-xs">
        <p className="text-yellow-800">使用简化地图</p>
        <p className="text-yellow-600">配置 Google Maps API 获得完整体验</p>
      </div>
    </div>
  );
}