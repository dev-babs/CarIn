"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { parseBookingQRData, validateQRCodeData, QRCodeData } from "@/lib/utils/qrCodeGenerator";

interface QRScannerProps {
  onScanSuccess: (data: QRCodeData) => void;
  onScanError?: (error: string) => void;
  expectedSigner?: string; // Optional: verify against a specific signer if known
}

export default function QRScanner({ onScanSuccess, onScanError, expectedSigner }: QRScannerProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    // Use a unique ID to avoid conflicts if multiple scanners exist
    const scannerId = "qr-reader-container";
    
    // Ensure cleanup of previous instance
    if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
    }

    const scanner = new Html5QrcodeScanner(
      scannerId,
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        // Pause scanning to process result
        try {
            scanner.pause(true);
        } catch (e) {
            console.warn("Failed to pause scanner", e);
        }

        setScanResult(decodedText);
        setValidationStatus('validating');

        const qrData = parseBookingQRData(decodedText);
        
        if (!qrData) {
            setValidationStatus('invalid');
            setErrorMsg("Invalid QR Code format");
            if (onScanError) onScanError("Invalid QR Code format");
            // Don't auto-resume for invalid format, let user retry manually
             return;
        }

        // Perform validation
        const validation = await validateQRCodeData(qrData, expectedSigner);
        
        if (validation.valid) {
            setValidationStatus('valid');
            onScanSuccess(qrData);
        } else {
            setValidationStatus('invalid');
            setErrorMsg(validation.error || "Validation failed");
            if (onScanError) onScanError(validation.error || "Validation failed");
        }
      },
      (errorMessage) => {
        // parse error, ignore it as it happens on every frame
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess, onScanError, expectedSigner]);

  const resetScanner = () => {
    setScanResult(null);
    setValidationStatus('idle');
    setErrorMsg(null);
    if (scannerRef.current) {
        scannerRef.current.resume();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-center">Scan Booking QR Code</h3>
      
      <div id="qr-reader-container" className="w-full overflow-hidden rounded-lg"></div>

      {validationStatus === 'validating' && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-blue-600">Verifying...</p>
        </div>
      )}

      {validationStatus === 'valid' && (
        <div className="text-center py-4 bg-green-50 rounded-lg mt-4 border border-green-200">
          <div className="text-green-600 text-xl font-bold mb-2 flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Access Granted
          </div>
          <p className="text-sm text-gray-600">Valid Booking Found</p>
          <button 
            onClick={resetScanner}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Scan Another
          </button>
        </div>
      )}

      {validationStatus === 'invalid' && (
        <div className="text-center py-4 bg-red-50 rounded-lg mt-4 border border-red-200">
          <div className="text-red-600 text-xl font-bold mb-2 flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Access Denied
          </div>
          <p className="text-sm text-red-500 font-medium">{errorMsg}</p>
          <button 
            onClick={resetScanner}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
