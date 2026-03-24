/**
 * Base map container component using Leaflet
 */

'use client';

import { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mapConfig } from '@/lib/config/map';
import { Coordinates } from '@/lib/utils/distance';

interface MapContainerProps {
  center: Coordinates;
  zoom?: number;
  children?: React.ReactNode;
  onMapReady?: (map: any) => void;
}

// Component to handle map instance
function MapController({
  center,
  zoom,
  onMapReady,
}: {
  center: Coordinates;
  zoom: number;
  onMapReady?: (map: any) => void;
}) {
  const map = useMap();
  const hasCalledReady = useRef(false);

  useEffect(() => {
    if (!hasCalledReady.current && onMapReady) {
      onMapReady(map);
      hasCalledReady.current = true;
    }
  }, [map, onMapReady]);

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);

  return null;
}

export default function MapContainer({
  center,
  zoom = mapConfig.defaultZoom,
  children,
  onMapReady,
}: MapContainerProps) {
  return (
    <div className="w-full h-full relative">
      <LeafletMap
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={zoom} onMapReady={onMapReady} />
        {children}
      </LeafletMap>
    </div>
  );
}




