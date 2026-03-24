/**
 * Geocoding utilities for address search
 * Supports both OpenStreetMap Nominatim and Google Geocoding API
 */

import { mapConfig } from '../config/map';

export interface GeocodeResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface GeocodeError {
  message: string;
  code?: string;
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult> {
  if (mapConfig.provider === 'google' && mapConfig.googleMapsApiKey) {
    return geocodeWithGoogle(address);
  } else {
    return geocodeWithNominatim(address);
  }
}

/**
 * Geocode using OpenStreetMap Nominatim (free, no API key required)
 */
async function geocodeWithNominatim(address: string): Promise<GeocodeResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CarIn-Parking-App',
      },
    });

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Address not found');
    }

    const result = data[0];

    return {
      address: result.display_name,
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
    };
  } catch (error: any) {
    throw {
      message: error.message || 'Failed to geocode address',
      code: 'GEOCODE_ERROR',
    };
  }
}

/**
 * Geocode using Google Maps Geocoding API
 */
async function geocodeWithGoogle(address: string): Promise<GeocodeResult> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${mapConfig.googleMapsApiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Google Geocoding API unavailable');
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error('Address not found');
    }

    const result = data.results[0];
    const location = result.geometry.location;

    return {
      address: result.formatted_address,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
    };
  } catch (error: any) {
    throw {
      message: error.message || 'Failed to geocode address',
      code: 'GEOCODE_ERROR',
    };
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  if (mapConfig.provider === 'google' && mapConfig.googleMapsApiKey) {
    return reverseGeocodeWithGoogle(lat, lng);
  } else {
    return reverseGeocodeWithNominatim(lat, lng);
  }
}

async function reverseGeocodeWithNominatim(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CarIn-Parking-App',
      },
    });

    if (!response.ok) {
      throw new Error('Reverse geocoding service unavailable');
    }

    const data = await response.json();

    return data.display_name || 'Unknown location';
  } catch (error: any) {
    return 'Unknown location';
  }
}

async function reverseGeocodeWithGoogle(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${mapConfig.googleMapsApiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Google Reverse Geocoding API unavailable');
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return 'Unknown location';
    }

    return data.results[0].formatted_address;
  } catch (error: any) {
    return 'Unknown location';
  }
}




