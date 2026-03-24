"use client";

import { useState } from "react";
import QRCodeDisplay from "./QRCodeDisplay";

interface Booking {
  id: string;
  spotId: string;
  spotLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  totalCost: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  qrCode?: string;
  transactionHash?: string;
  signature?: string;
  signerAddress?: string;
}

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [showQR, setShowQR] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{booking.spotLocation}</h3>
          <p className="text-sm text-gray-500">
            Booking #{booking.id.slice(-8)}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            booking.status
          )}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">
            {new Date(booking.date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Time:</span>
          <span className="font-medium">
            {booking.startTime} - {booking.endTime}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cost:</span>
          <span className="font-medium text-blue-600">
            {booking.totalCost} cUSD
          </span>
        </div>
        {booking.transactionHash && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">TX:</span>
            <span className="font-mono text-gray-500">
              {booking.transactionHash.slice(0, 10)}...
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex-1 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          {showQR ? "Hide" : "Show"} QR Code
        </button>
        <button
          onClick={() => (window.location.href = `/booking/${booking.spotId}`)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
      </div>

      {showQR && (
        <div className="mt-4 pt-4 border-t text-center">
          <div className="flex justify-center">
            <QRCodeDisplay
              bookingId={booking.id}
              spotId={booking.spotId}
              spotLocation={booking.spotLocation}
              signature={booking.signature}
              signerAddress={booking.signerAddress}
              timestamp={new Date(booking.date).getTime()}
            />
          </div>
        </div>
      )}
    </div>
  );
}


