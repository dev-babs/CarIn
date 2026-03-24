"use client";

import { useState, useEffect } from "react";

interface SpotAvailabilityCheckerProps {
  spotId: string;
  selectedDate: Date | null;
  startTime: string;
  endTime: string;
  onAvailabilityChange: (isAvailable: boolean) => void;
}

export default function SpotAvailabilityChecker({
  spotId,
  selectedDate,
  startTime,
  endTime,
  onAvailabilityChange,
}: SpotAvailabilityCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!selectedDate || !startTime || !endTime) {
      setIsAvailable(true);
      return;
    }

    checkAvailability();
  }, [spotId, selectedDate, startTime, endTime]);

  const checkAvailability = async () => {
    setChecking(true);
    try {
      // TODO: Check spot availability from smart contract
      // const contract = getParkingSpotContract();
      // const spot = await contract.getSpot(spotId);
      // const bookings = await contract.getSpotBookings(spotId);
      // Check for conflicts...
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsAvailable(true);
      onAvailabilityChange(true);
    } catch (error) {
      console.error("Error checking availability:", error);
      setIsAvailable(false);
      onAvailabilityChange(false);
    } finally {
      setChecking(false);
    }
  };

  if (!selectedDate || !startTime || !endTime) {
    return null;
  }

  if (checking) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
        Checking availability...
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
        ⚠️ This spot is not available for the selected time slot
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
      ✓ Spot is available for the selected time
    </div>
  );
}




