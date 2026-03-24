"use client";

import { useState } from "react";
import { useBookingTransaction } from "@/lib/hooks/useBookingTransaction";

interface Spot {
  id: string;
  location: string;
  pricePerHour: string;
}

interface BookingSummaryProps {
  spot: Spot;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  onBack: () => void;
  onConfirm: () => void;
  userAddress: string;
}

export default function BookingSummary({
  spot,
  selectedDate,
  startTime,
  endTime,
  onBack,
  onConfirm,
  userAddress,
}: BookingSummaryProps) {
  const { createBooking, loading, error } = useBookingTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateHours = () => {
    const start = parseInt(startTime.split(":")[0]);
    const end = parseInt(endTime.split(":")[0]);
    return end > start ? end - start : (24 - start) + end || 1;
  };

  const hours = calculateHours();
  const pricePerHour = parseFloat(spot.pricePerHour);
  const subtotal = pricePerHour * hours;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const bookingData = {
        spotId: spot.id,
        date: selectedDate.toISOString(),
        startTime,
        endTime,
        hours,
        totalCost: total.toString(),
      };

      const result = await createBooking(bookingData, userAddress);
      if (result.success) {
        onConfirm();
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Booking Summary</h3>

      {/* Booking Details */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{spot.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{startTime} - {endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{hours} hour(s)</span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Cost Breakdown</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal ({hours} hrs × {spot.pricePerHour} cUSD/hr):</span>
            <span>{subtotal.toFixed(2)} cUSD</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Service Fee (5%):</span>
            <span>{serviceFee.toFixed(2)} cUSD</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600">{total.toFixed(2)} cUSD</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          disabled={isProcessing || loading}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing || loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing || loading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}




