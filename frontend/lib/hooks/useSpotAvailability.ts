/**
 * Hook to check and update real-time spot availability
 */

import { useState, useEffect, useCallback } from 'react';
import { ParkingSpot } from './useParkingSpots';

interface AvailabilityStatus {
  spotId: number;
  isAvailable: boolean;
  lastChecked: number;
}

const AVAILABILITY_CHECK_INTERVAL = 30000; // 30 seconds

export function useSpotAvailability(spots: ParkingSpot[]) {
  const [availabilityMap, setAvailabilityMap] = useState<
    Map<number, AvailabilityStatus>
  >(new Map());

  const checkAvailability = useCallback(async (spotId: number) => {
    try {
      // TODO: Query smart contract for real-time availability
      // For now, simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock: randomly update availability (remove in production)
      const isAvailable = Math.random() > 0.3; // 70% chance available

      setAvailabilityMap(prev => {
        const newMap = new Map(prev);
        newMap.set(spotId, {
          spotId,
          isAvailable,
          lastChecked: Date.now(),
        });
        return newMap;
      });
    } catch (error) {
      console.error(`Failed to check availability for spot ${spotId}:`, error);
    }
  }, []);

  const checkAllSpots = useCallback(async () => {
    await Promise.all(spots.map(spot => checkAvailability(spot.id)));
  }, [spots, checkAvailability]);

  useEffect(() => {
    // Initial check
    checkAllSpots();

    // Set up interval for periodic checks
    const interval = setInterval(() => {
      checkAllSpots();
    }, AVAILABILITY_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkAllSpots]);

  const getAvailability = useCallback(
    (spotId: number): boolean | null => {
      const status = availabilityMap.get(spotId);
      if (!status) return null;
      return status.isAvailable;
    },
    [availabilityMap]
  );

  return {
    availabilityMap,
    getAvailability,
    refreshAvailability: checkAllSpots,
  };
}




