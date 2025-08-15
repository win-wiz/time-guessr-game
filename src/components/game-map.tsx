"use client";

import { useCallback, useMemo } from "react";
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

const guessMarkerIcon = {
  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

const actualMarkerIcon = {
  url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
};

export function GameMap({
  onMapClick,
  guessLocation,
  actualLocation,
  isGuessing,
}: GameMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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
        center={defaultCenter}
        zoom={4}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {guessLocation && (
          <MarkerF
            position={guessLocation}
            icon={guessMarkerIcon}
          />
        )}
        {actualLocation && (
          <MarkerF
            position={actualLocation}
            icon={actualMarkerIcon}
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
}