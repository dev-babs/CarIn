/**
 * Centralized error message handling for booking system
 */

export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "Please connect your wallet to continue",
  INSUFFICIENT_BALANCE: "Insufficient balance for this transaction",
  TRANSACTION_REJECTED: "Transaction was rejected by user",
  TRANSACTION_FAILED: "Transaction failed. Please try again",
  NETWORK_ERROR: "Network error. Please check your connection",
  SPOT_NOT_AVAILABLE: "This parking spot is no longer available",
  BOOKING_EXISTS: "You already have an active booking for this spot",
  INVALID_TIME: "Invalid time selection. Please choose a valid time range",
  INVALID_DATE: "Date cannot be in the past",
  MIN_DURATION: "Minimum booking duration is 1 hour",
  MAX_DURATION: "Maximum booking duration is 24 hours",
  CONTRACT_ERROR: "Smart contract interaction failed",
  USER_REJECTED: "User rejected the transaction",
} as const;

export function getErrorMessage(error: any): string {
  if (typeof error === "string") {
    return error;
  }

  if (error?.message) {
    const message = error.message.toLowerCase();

    if (message.includes("user rejected") || message.includes("user denied")) {
      return ERROR_MESSAGES.USER_REJECTED;
    }
    if (message.includes("insufficient")) {
      return ERROR_MESSAGES.INSUFFICIENT_BALANCE;
    }
    if (message.includes("network")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (message.includes("contract")) {
      return ERROR_MESSAGES.CONTRACT_ERROR;
    }

    return error.message;
  }

  return ERROR_MESSAGES.TRANSACTION_FAILED;
}




