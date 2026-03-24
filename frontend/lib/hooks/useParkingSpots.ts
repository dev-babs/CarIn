/**
 * Hook to fetch and cache parking spots for map display
 */

import { useState, useEffect, useCallback } from 'react';
import { useParkingSpot } from './useParkingSpot';

export interface ParkingSpot {
  id: number;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  pricePerHour: string;
  isAvailable: boolean;
  owner: string;
  images: string[];
  description?: string;
  totalBookings?: number;
}

interface UseParkingSpotsState {
  spots: ParkingSpot[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const CACHE_DURATION = 30000; // 30 seconds cache

export function useParkingSpots() {
  const [state, setState] = useState<UseParkingSpotsState>({
    spots: [],
    loading: false,
    error: null,
    lastFetch: null,
  });

  const fetchSpots = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // TODO: Integrate with ParkingSpot smart contract
      // For now, use mock data with coordinates
      const mockSpots: ParkingSpot[] = [
        {
          id: 1,
          location: '123 Main St, San Francisco, CA',
          coordinates: { lat: 37.7749, lng: -122.4194 },
          pricePerHour: '2.50',
          isAvailable: true,
          owner: '0x123...',
          images: [],
          description: 'Convenient street parking near downtown',
        },
        {
          id: 2,
          location: '456 Market St, San Francisco, CA',
          coordinates: { lat: 37.7849, lng: -122.4094 },
          pricePerHour: '3.00',
          isAvailable: true,
          owner: '0x456...',
          images: [],
          description: 'Premium parking spot in financial district',
        },
        {
          id: 3,
          location: '789 Mission St, San Francisco, CA',
          coordinates: { lat: 37.7649, lng: -122.4294 },
          pricePerHour: '1.75',
          isAvailable: false,
          owner: '0x789...',
          images: [],
          description: 'Affordable parking option',
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setState({
        spots: mockSpots,
        loading: false,
        error: null,
        lastFetch: Date.now(),
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch parking spots',
      }));
    }
  }, []);

  const refreshSpots = useCallback(() => {
    fetchSpots();
  }, [fetchSpots]);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  const shouldRefresh = useCallback(() => {
    if (!state.lastFetch) return true;
    return Date.now() - state.lastFetch > CACHE_DURATION;
  }, [state.lastFetch]);

  useEffect(() => {
    // Auto-refresh when cache expires
    if (shouldRefresh() && !state.loading) {
      const interval = setInterval(() => {
        if (shouldRefresh()) {
          fetchSpots();
        }
      }, CACHE_DURATION);

      return () => clearInterval(interval);
    }
  }, [shouldRefresh, state.loading, fetchSpots]);

  return {
    spots: state.spots,
    loading: state.loading,
    error: state.error,
    refresh: refreshSpots,
  };
}




