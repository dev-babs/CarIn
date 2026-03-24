"use client";

import { useState } from "react";
import DateTimePicker from "./DateTimePicker";
import BookingSummary from "./BookingSummary";
import BookingConfirmation from "./BookingConfirmation";

interface Spot {
  id: string;
  location: string;
  pricePerHour: string;
  images: string[];
  description: string;
  owner: string;
  isAvailable: boolean;
}

interface BookingFlowProps {
  spot: Spot;
  userAddress: string;
}

export default function BookingFlow({ spot, userAddress }: BookingFlowProps) {
  const [step, setStep] = useState<"select-time" | "summary" | "confirming" | "confirmed">("select-time");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDateTimeSelect = (date: Date | null, start: string, end: string) => {
    setSelectedDate(date);
    setStartTime(start);
    setEndTime(end);
    setStep("summary");
  };

  const handleBack = () => {
    setStep("select-time");
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !startTime || !endTime) {
      setError("Please select date and time");
      return;
    }

    setStep("confirming");
    setError(null);

    try {
      // TODO: Integrate with smart contracts
      // This will be handled in the transaction signing component
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockBookingId = `booking_${Date.now()}`;
      // Mock signature generation
      const mockSignature = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
      
      setBookingId(mockBookingId);
      setSignature(mockSignature);
      setStep("confirmed");
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
      setStep("summary");
    }
  };

  if (step === "confirmed" && bookingId) {
    return (
      <BookingConfirmation 
        bookingId={bookingId} 
        spot={spot} 
        signature={signature || undefined}
        userAddress={userAddress}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Book Parking Spot</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {step === "select-time" && (
        <DateTimePicker
          spot={spot}
          onSelect={handleDateTimeSelect}
        />
      )}

      {step === "summary" && selectedDate && (
        <BookingSummary
          spot={spot}
          selectedDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          onBack={handleBack}
          onConfirm={handleConfirm}
          userAddress={userAddress}
        />
      )}

      {step === "confirming" && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Processing your booking...</p>
          <p className="text-sm text-gray-500 mt-2">Please confirm the transaction in your wallet</p>
        </div>
      )}
    </div>
  );
}


