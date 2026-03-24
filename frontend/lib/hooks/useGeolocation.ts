/**
 * Hook to get user's geolocation
 */

import { useState, useEffect, useCallback } from 'react';

export interface Location {
  lat: number;
  lng: number;
}

export interface GeolocationState {
  location: Location | null;
  loading: boolean;
  error: GeolocationError | null;
  permissionDenied: boolean;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        loading: false,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser',
        },
        permissionDenied: false,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
          permissionDenied: false,
        });
      },
      (error) => {
        setState({
          location: null,
          loading: false,
          error: {
            code: error.code,
            message: error.message,
          },
          permissionDenied: error.code === 1,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    // Auto-fetch on mount (optional - can be removed if manual trigger preferred)
    // getCurrentPosition();
  }, [getCurrentPosition]);

  return {
    ...state,
    getCurrentPosition,
  };
}




