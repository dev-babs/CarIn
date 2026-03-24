/**
 * Map control buttons (center, zoom, fullscreen)
 */

'use client';

import { useMap } from 'react-leaflet';
import { Coordinates } from '@/lib/utils/distance';
import { useGeolocation } from '@/lib/hooks/useGeolocation';

interface MapControlsProps {
  onCenterChange?: (center: Coordinates) => void;
}

export default function MapControls({ onCenterChange }: MapControlsProps) {
  const map = useMap();
  const { location, getCurrentPosition } = useGeolocation();

  const centerToUser = () => {
    if (location) {
      map.setView([location.lat, location.lng], 15);
      onCenterChange?.(location);
    } else {
      getCurrentPosition();
    }
  };

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  const toggleFullscreen = () => {
    const element = map.getContainer();
    if (!document.fullscreenElement) {
      element.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={centerToUser}
        className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Center on my location"
      >
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={zoomIn}
          className="p-2 hover:bg-gray-50 transition-colors border-b border-gray-200"
          title="Zoom in"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          className="p-2 hover:bg-gray-50 transition-colors"
          title="Zoom out"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
      </div>

      <button
        onClick={toggleFullscreen}
        className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Toggle fullscreen"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>
  );
}




