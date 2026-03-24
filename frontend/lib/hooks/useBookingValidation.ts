import { useCallback } from "react";

export interface BookingValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useBookingValidation() {
  const validateBooking = useCallback((
    date: Date | null,
    startTime: string,
    endTime: string,
    pricePerHour: string
  ): BookingValidationResult => {
    const errors: string[] = [];

    // Date validation
    if (!date) {
      errors.push("Please select a date");
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        errors.push("Date cannot be in the past");
      }
    }

    // Time validation
    if (!startTime || !endTime) {
      errors.push("Please select both start and end times");
    } else {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
        errors.push("End time must be after start time");
      }

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes > startMinutes 
        ? endMinutes - startMinutes 
        : (24 * 60) - startMinutes + endMinutes;

      if (duration < 60) {
        errors.push("Minimum booking duration is 1 hour");
      }

      if (duration > 24 * 60) {
        errors.push("Maximum booking duration is 24 hours");
      }
    }

    // Price validation
    if (!pricePerHour || parseFloat(pricePerHour) <= 0) {
      errors.push("Invalid price");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  return {
    validateBooking,
  };
}




