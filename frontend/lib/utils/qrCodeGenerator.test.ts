import {
  generateBookingQRData,
  validateQRCodeData,
  generateAccessMessage,
  QRCodeData,
} from "./qrCodeGenerator";
import { verifyMessage } from "viem";

// Mock viem verifyMessage
jest.mock("viem", () => ({
  verifyMessage: jest.fn(),
}));

describe("qrCodeGenerator", () => {
  const mockBookingId = "booking-123";
  const mockSpotId = "spot-456";
  const mockLocation = "123 Main St";
  const mockTimestamp = Date.now();
  const mockSigner = "0x1234567890123456789012345678901234567890";
  const mockSignature = "0xsignature";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateBookingQRData", () => {
    it("should generate valid QR data structure", () => {
      const resultString = generateBookingQRData(
        mockBookingId,
        mockSpotId,
        mockLocation,
        mockSignature,
        mockSigner,
        mockTimestamp
      );

      const result = JSON.parse(resultString);

      expect(result).toEqual({
        bookingId: mockBookingId,
        spotId: mockSpotId,
        location: mockLocation,
        timestamp: mockTimestamp,
        type: "parking_access",
        signature: mockSignature,
        signerAddress: mockSigner,
      });
    });

    it("should use current timestamp if not provided", () => {
      const resultString = generateBookingQRData(
        mockBookingId,
        mockSpotId,
        mockLocation
      );
      const result = JSON.parse(resultString);
      expect(result.timestamp).toBeDefined();
      expect(Date.now() - result.timestamp).toBeLessThan(1000);
    });
  });

  describe("validateQRCodeData", () => {
    it("should validate valid QR data", async () => {
      (verifyMessage as jest.Mock).mockResolvedValue(true);

      const qrData: QRCodeData = {
        bookingId: mockBookingId,
        spotId: mockSpotId,
        location: mockLocation,
        timestamp: Date.now(),
        type: "parking_access",
        signature: mockSignature,
        signerAddress: mockSigner,
      };

      const result = await validateQRCodeData(qrData, mockSigner);
      expect(result.valid).toBe(true);
    });

    it("should fail if expired", async () => {
      const expiredTimestamp = Date.now() - 49 * 60 * 60 * 1000; // 49 hours ago
      const qrData: QRCodeData = {
        bookingId: mockBookingId,
        spotId: mockSpotId,
        timestamp: expiredTimestamp,
        type: "parking_access",
      };

      const result = await validateQRCodeData(qrData, mockSigner);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("should fail if signer address mismatch", async () => {
      const qrData: QRCodeData = {
        bookingId: mockBookingId,
        spotId: mockSpotId,
        timestamp: Date.now(),
        type: "parking_access",
        signature: mockSignature,
        signerAddress: "0xotheraddress",
      };

      const result = await validateQRCodeData(qrData, mockSigner);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Signer address mismatch");
    });

    it("should fail if signature is invalid", async () => {
      (verifyMessage as jest.Mock).mockResolvedValue(false);

      const qrData: QRCodeData = {
        bookingId: mockBookingId,
        spotId: mockSpotId,
        timestamp: Date.now(),
        type: "parking_access",
        signature: mockSignature,
        signerAddress: mockSigner,
      };

      const result = await validateQRCodeData(qrData, mockSigner);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid signature");
    });
  });
});
