"use client";

import { useState, useMemo } from "react";
import QRCode from "qrcode.react";
import { generateBookingQRData } from "@/lib/utils/qrCodeGenerator";

interface QRCodeDisplayProps {
  bookingId: string;
  spotId: string;
  spotLocation: string;
  signature?: string;
  signerAddress?: string;
  timestamp?: number;
  onSave?: () => void;
}

export default function QRCodeDisplay({
  bookingId,
  spotId,
  spotLocation,
  signature,
  signerAddress,
  timestamp,
  onSave,
}: QRCodeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const qrData = useMemo(() => {
    return generateBookingQRData(
      bookingId,
      spotId,
      spotLocation,
      signature,
      signerAddress,
      timestamp
    );
  }, [bookingId, spotId, spotLocation, signature, signerAddress, timestamp]);

  const handleDownload = () => {
    setIsDownloading(true);
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `booking-${bookingId}-qr.png`;
      link.href = url;
      link.click();
    }
    setIsDownloading(false);
    if (onSave) onSave();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center max-w-sm mx-auto w-full">
      <h3 className="text-xl font-semibold mb-4">Your Booking QR Code</h3>
      <p className="text-sm text-gray-600 mb-6">
        Show this QR code at the parking location for access
      </p>

      <div className="bg-gray-50 rounded-lg p-4 md:p-6 inline-block mb-6 w-full flex justify-center">
        <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-300">
          <QRCode
            id="qr-code-canvas"
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            className="w-full h-auto"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          <p>Booking ID: <span className="font-mono font-medium break-all">{bookingId}</span></p>
          {signature && (
            <p className="mt-2 text-xs text-green-600 flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Digitally Signed
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors w-full sm:w-auto"
          >
            {isDownloading ? "Downloading..." : "Save QR Code"}
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}


