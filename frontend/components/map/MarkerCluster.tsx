/**
 * Marker clustering component for performance optimization
 */

'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface MarkerClusterProps {
  markers: Array<{
    position: [number, number];
    popup: React.ReactNode;
    onClick?: () => void;
  }>;
}

export default function MarkerCluster({ markers }: MarkerClusterProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create marker cluster group
    const markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    // Create markers and add to cluster group
    markers.forEach(({ position, popup, onClick }) => {
      const marker = L.marker(position);
      
      if (popup) {
        marker.bindPopup(popup as any);
      }

      if (onClick) {
        marker.on('click', onClick);
      }

      markerClusterGroup.addLayer(marker);
    });

    // Add cluster group to map
    map.addLayer(markerClusterGroup);

    // Cleanup
    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [map, markers]);

  return null;
}




