/**
 * Map configuration and API key management
 * Supports both Leaflet (OpenStreetMap) and Google Maps
 */

export type MapProvider = 'leaflet' | 'google';

export interface MapConfig {
  provider: MapProvider;
  googleMapsApiKey?: string;
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  maxZoom: number;
  minZoom: number;
}

// Default to San Francisco (can be changed based on deployment location)
const DEFAULT_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
};

export const mapConfig: MapConfig = {
  provider: (process.env.NEXT_PUBLIC_MAP_PROVIDER as MapProvider) || 'leaflet',
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  defaultCenter: DEFAULT_CENTER,
  defaultZoom: 13,
  maxZoom: 18,
  minZoom: 10,
};

export function getMapProvider(): MapProvider {
  return mapConfig.provider;
}

export function hasGoogleMapsApiKey(): boolean {
  return !!mapConfig.googleMapsApiKey;
}




