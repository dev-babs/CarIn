/**
 * Dispute Calculation Utilities
 * Helper functions for calculating refunds, delays, and dispute metrics
 */

import { CheckInData } from '@/lib/contracts/disputeResolution';

/**
 * Calculate refund percentage for late check-in
 * @param bookingStartTime Booking start timestamp
 * @param checkInTime Actual check-in timestamp
 * @param lateThreshold Minutes late before refund starts
 * @param maxRefund Maximum refund percentage (default 50%)
 * @returns Refund percentage (0-100)
 */
export function calculateLateCheckInRefund(
  bookingStartTime: bigint,
  checkInTime: bigint,
  lateThreshold: number = 30,
  maxRefund: number = 50
): number {
  const startTime = Number(bookingStartTime);
  const actualCheckIn = Number(checkInTime);
  const lateMinutes = Math.floor((actualCheckIn - startTime) / 60) - lateThreshold;

  if (lateMinutes <= 0) {
    return 0;
  }

  // 1% refund per minute late, capped at maxRefund
  const refundPercent = Math.min(lateMinutes, maxRefund);
  return refundPercent;
}

/**
 * Calculate refund percentage for early check-out
 * @param bookingStartTime Booking start timestamp
 * @param bookingEndTime Booking end timestamp
 * @param checkOutTime Actual check-out timestamp
 * @param maxRefund Maximum refund percentage (default 30%)
 * @returns Refund percentage (0-100)
 */
export function calculateEarlyCheckOutRefund(
  bookingStartTime: bigint,
  bookingEndTime: bigint,
  checkOutTime: bigint,
  maxRefund: number = 30
): number {
  const startTime = Number(bookingStartTime);
  const endTime = Number(bookingEndTime);
  const actualCheckOut = Number(checkOutTime);

  const totalMinutes = Math.floor((endTime - startTime) / 60);
  const unusedMinutes = Math.floor((endTime - actualCheckOut) / 60);

  if (unusedMinutes <= 0 || totalMinutes === 0) {
    return 0;
  }

  const refundPercent = Math.min((unusedMinutes * 100) / totalMinutes, maxRefund);
  return refundPercent;
}

/**
 * Check if booking qualifies for no-show refund
 * @param bookingStartTime Booking start timestamp
 * @param checkInData Check-in data or null
 * @param noShowThreshold Hours before no-show detection
 * @returns True if qualifies for no-show refund
 */
export function isNoShow(
  bookingStartTime: bigint,
  checkInData: CheckInData | null,
  noShowThreshold: number = 1
): boolean {
  if (checkInData?.checkedIn) {
    return false;
  }

  const startTime = Number(bookingStartTime);
  const currentTime = Math.floor(Date.now() / 1000);
  const hoursSinceStart = (currentTime - startTime) / 3600;

  return hoursSinceStart >= noShowThreshold;
}

/**
 * Calculate dispute age in days
 * @param filedAt Timestamp when dispute was filed
 * @returns Number of days since filing
 */
export function getDisputeAge(filedAt: bigint): number {
  const filed = Number(filedAt);
  const current = Math.floor(Date.now() / 1000);
  const days = (current - filed) / 86400;
  return Math.floor(days);
}

/**
 * Check if dispute resolution is overdue
 * @param filedAt Timestamp when dispute was filed
 * @param maxResolutionTime Maximum resolution time in seconds
 * @returns True if overdue
 */
export function isResolutionOverdue(
  filedAt: bigint,
  maxResolutionTime: number = 7 * 24 * 60 * 60
): boolean {
  const age = getDisputeAge(filedAt);
  const maxDays = maxResolutionTime / 86400;
  return age > maxDays;
}

/**
 * Format refund amount from percentage
 * @param escrowAmount Total escrow amount
 * @param refundPercentage Refund percentage (0-100)
 * @returns Refund amount
 */
export function calculateRefundAmount(
  escrowAmount: bigint,
  refundPercentage: number
): bigint {
  return (escrowAmount * BigInt(refundPercentage)) / BigInt(100);
}

/**
 * Get dispute urgency level
 * @param filedAt Timestamp when dispute was filed
 * @param maxResolutionTime Maximum resolution time
 * @returns Urgency level: 'low' | 'medium' | 'high' | 'urgent'
 */
export function getDisputeUrgency(
  filedAt: bigint,
  maxResolutionTime: number = 7 * 24 * 60 * 60
): 'low' | 'medium' | 'high' | 'urgent' {
  const age = getDisputeAge(filedAt);
  const maxDays = maxResolutionTime / 86400;
  const percentage = (age / maxDays) * 100;

  if (percentage >= 100) return 'urgent';
  if (percentage >= 75) return 'high';
  if (percentage >= 50) return 'medium';
  return 'low';
}

