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

// Move static objects outside component to prevent recreation on each render
const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 34.091158, 
  lng: -118.2795188
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

const polylineOptions = {
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
};

// Create marker icon functions outside component to avoid recreation
const createGuessMarkerIcon = () => ({
  url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
      <circle cx="16" cy="16" r="6" fill="#ffffff"/>
      <text x="16" y="20" text-anchor="middle" fill="#ef4444" font-size="8" font-weight="bold">G</text>
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
      <text x="16" y="20" text-anchor="middle" fill="#22c55e" font-size="8" font-weight="bold">A</text>
    </svg>
  `),
  scaledSize: new google.maps.Size(32, 32),
  anchor: new google.maps.Point(16, 16),
});

// Memoize marker icons to prevent recreation
let guessMarkerIcon: google.maps.Icon | undefined;
let actualMarkerIcon: google.maps.Icon | undefined;

const getGuessMarkerIcon = (): google.maps.Icon | undefined => {
  if (!guessMarkerIcon && typeof google !== 'undefined') {
    guessMarkerIcon = createGuessMarkerIcon();
  }
  return guessMarkerIcon;
};

const getActualMarkerIcon = (): google.maps.Icon | undefined => {
  if (!actualMarkerIcon && typeof google !== 'undefined') {
    actualMarkerIcon = createActualMarkerIcon();
  }
  return actualMarkerIcon;
};

export const GameMap = memo(function GameMap({
  onMapClick,
  guessLocation,
  actualLocation,
  isGuessing,
}: GameMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Optimize map center calculation with better memoization
  const mapCenter = useMemo(() => {
    return guessLocation || actualLocation || defaultCenter;
  }, [guessLocation, actualLocation]);

  // Optimize zoom calculation
  const mapZoom = useMemo(() => {
    return (guessLocation || actualLocation) ? 10 : 4;
  }, [guessLocation, actualLocation]);
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isGuessing && onMapClick && e.latLng) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  }, [isGuessing, onMapClick]);

  // Optimize polyline path calculation
  const polylinePath = useMemo(() => {
    return (guessLocation && actualLocation) ? [guessLocation, actualLocation] : [];
  }, [guessLocation, actualLocation]);

  // Memoize marker icons
  const guessIcon = useMemo(() => getGuessMarkerIcon(), []);
  const actualIcon = useMemo(() => getActualMarkerIcon(), []);

  if (loadError) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-red-900/50 to-red-800/50 flex items-center justify-center rounded-lg border border-red-500/30">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-white font-bold mb-2">Map Loading Failed</p>
          <p className="text-red-200 text-sm mb-4">
            Error: {loadError.message}
          </p>
          <p className="text-red-300 text-xs">
            Please check Google Maps API Key configuration
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
          <p className="text-white font-bold mb-2">Loading Map...</p>
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm">
            API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Configured' : '❌ Not Configured'}
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
            icon={guessIcon}
          />
        )}
        {actualLocation && (
          <MarkerF
            position={actualLocation}
            icon={actualIcon}
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