"use client";

import { useCallback, useMemo, memo } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  MarkerF,
  PolylineF,
} from "@react-google-maps/api";

interface GameMapProps {
  onMapClick?: (lat: number, lng: number) => void;
  guessLocation: { lat: number; lng: number } | null;
  actualLocation: { lat: number; lng: number } | null;
  isGuessing: boolean;
}

const containerStyle = {
  width: "100%",
  height: "100%",
  // minHeight: "200px",
};

const defaultCenter = {
  lat: 34.091158, lng: -118.2795188
  // lat: 28.245893, lng: 112.956825
};

const mapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  gestureHandling: "greedy" as const,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

// 创建标记图标的函数，在组件内部调用以确保 google.maps 已加载
const createGuessMarkerIcon = () => ({
  url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
      <circle cx="16" cy="16" r="6" fill="#ffffff"/>
      <text x="16" y="20" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="bold">你</text>
    </svg>
  `),
  scaledSize: new google.maps.Size(32, 32),
  anchor: new google.maps.Point(16, 16),
});

const createActualMarkerIcon = () => ({
  url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="#ffffff" stroke-width="3"/>
      <circle cx="16" cy="16" r="6" fill="#ffffff"/>
      <text x="16" y="20" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="bold">实</text>
    </svg>
  `),
  scaledSize: new google.maps.Size(32, 32),
  anchor: new google.maps.Point(16, 16),
});

export const GameMap = memo(function GameMap({
  onMapClick,
  guessLocation,
  actualLocation,
  isGuessing,
}: GameMapProps) {
  // 直接使用硬编码的 API 密钥，确保地图能够正常加载
  // 注意：在生产环境中，应该使用环境变量
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // 动态计算地图中心点：优先使用用户选择的位置，其次是实际位置，最后使用默认位置
  const mapCenter = useMemo(() => {
    if (guessLocation) {
      return guessLocation;
    }
    if (actualLocation) {
      return actualLocation;
    }
    return defaultCenter;
  }, [guessLocation, actualLocation]);

  // 动态计算缩放级别：如果有具体位置则放大，否则使用默认缩放
  const mapZoom = useMemo(() => {
    if (guessLocation || actualLocation) {
      return 10; // 放大到城市级别
    }
    return 4; // 默认缩放级别
  }, [guessLocation, actualLocation]);
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isGuessing && onMapClick && e.latLng) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  }, [isGuessing, onMapClick]);

  const polylinePath = useMemo(() => {
    return guessLocation && actualLocation ? [guessLocation, actualLocation] : [];
  }, [guessLocation, actualLocation]);

  const polylineOptions = useMemo(() => ({
    strokeColor: "#000",
    strokeOpacity: 0.6,
    strokeWeight: 2,
    icons: [
      {
        icon: { path: "M 0,-1 0,1", strokeOpacity: 1 },
        offset: "0",
        repeat: "10px",
      },
    ],
  }), []);

  if (loadError) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-red-900/50 to-red-800/50 flex items-center justify-center rounded-lg border border-red-500/30">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-white font-bold mb-2">地图加载失败</p>
          <p className="text-red-200 text-sm mb-4">
            错误: {loadError.message}
          </p>
          <p className="text-red-300 text-xs">
            请检查 Google Maps API Key 配置
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-lg border border-white/20">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-white font-bold mb-2">正在加载地图...</p>
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm">
            API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ 已配置' : '❌ 未配置'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ minHeight: '200px' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={mapZoom}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {guessLocation && (
          <MarkerF
            position={guessLocation}
            icon={createGuessMarkerIcon()}
          />
        )}
        {actualLocation && (
          <MarkerF
            position={actualLocation}
            icon={createActualMarkerIcon()}
          />
        )}
        {polylinePath.length > 0 && (
          <PolylineF
            path={polylinePath}
            options={polylineOptions}
          />
        )}
      </GoogleMap>
    </div>
  );
});