import { verifyMessage } from "viem";

/**
 * QR Code generation utilities for booking access
 */

export interface QRCodeData {
  bookingId: string;
  spotId: string;
  location?: string;
  timestamp: number;
  type: "parking_access";
  signature?: string; // Cryptographic signature
  signerAddress?: string; // Address of the signer (booker)
}

/**
 * Generate the message to be signed
 */
export function generateAccessMessage(
  bookingId: string,
  timestamp: number
): string {
  return `Access Request for Booking: ${bookingId}\nTimestamp: ${timestamp}`;
}

/**
 * Generate QR code data string for booking
 */
export function generateBookingQRData(
  bookingId: string,
  spotId: string,
  location?: string,
  signature?: string,
  signerAddress?: string,
  timestamp?: number
): string {
  const data: QRCodeData = {
    bookingId,
    spotId,
    location,
    timestamp: timestamp || Date.now(),
    type: "parking_access",
    signature,
    signerAddress,
  };

  return JSON.stringify(data);
}

/**
 * Parse QR code data string
 */
export function parseBookingQRData(qrString: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrString);

    // Validate required fields
    if (!data.bookingId || !data.spotId || !data.type) {
      return null;
    }

    return data as QRCodeData;
  } catch (error) {
    return null;
  }
}

/**
 * Validate QR code data (check expiration, signature, etc.)
 */
export async function validateQRCodeData(
  qrData: QRCodeData,
  expectedSigner?: string,
  maxAgeHours: number = 48
): Promise<{ valid: boolean; error?: string }> {
  // Check timestamp
  const age = Date.now() - qrData.timestamp;
  const maxAge = maxAgeHours * 60 * 60 * 1000;

  if (age > maxAge) {
    return { valid: false, error: "QR code expired" };
  }

  // Verify signature if present and expected signer is provided
  if (qrData.signature && expectedSigner) {
    if (
      !qrData.signerAddress ||
      qrData.signerAddress.toLowerCase() !== expectedSigner.toLowerCase()
    ) {
      return { valid: false, error: "Signer address mismatch" };
    }

    const message = generateAccessMessage(qrData.bookingId, qrData.timestamp);
    try {
      const isValid = await verifyMessage({
        address: expectedSigner as `0x${string}`,
        message: message,
        signature: qrData.signature as `0x${string}`,
      });

      if (!isValid) {
        return { valid: false, error: "Invalid signature" };
      }
    } catch (error) {
      return { valid: false, error: "Signature verification failed" };
    }
  } else if (expectedSigner) {
    return { valid: false, error: "Missing signature" };
  }

  return { valid: true };
}


