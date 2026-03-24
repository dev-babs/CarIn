/**
 * Utility functions for booking calculations
 */

export interface TimeSlot {
  startTime: string;
  endTime: string;
  date: Date;
}

/**
 * Calculate booking duration in hours
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes > startMinutes) {
    return (endMinutes - startMinutes) / 60;
  } else {
    // Handles overnight bookings
    return ((24 * 60) - startMinutes + endMinutes) / 60;
  }
}

/**
 * Calculate total cost
 */
export function calculateTotalCost(
  pricePerHour: string,
  hours: number,
  serviceFeePercent: number = 5
): {
  subtotal: number;
  serviceFee: number;
  total: number;
} {
  const price = parseFloat(pricePerHour);
  const subtotal = price * hours;
  const serviceFee = subtotal * (serviceFeePercent / 100);
  const total = subtotal + serviceFee;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    serviceFee: parseFloat(serviceFee.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

/**
 * Format date and time for display
 */
export function formatBookingDateTime(date: Date, startTime: string, endTime: string): string {
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${dateStr}, ${startTime} - ${endTime}`;
}

/**
 * Check if booking time is in the future
 */
export function isBookingInFuture(date: Date, startTime: string): boolean {
  const now = new Date();
  const bookingDateTime = new Date(date);
  const [hour, minute] = startTime.split(":").map(Number);
  bookingDateTime.setHours(hour, minute, 0, 0);

  return bookingDateTime > now;
}




