"use client";

import QRCodeDisplay from "./QRCodeDisplay";

interface Spot {
  id: string;
  location: string;
}

interface BookingConfirmationProps {
  bookingId: string;
  spot: Spot;
  signature?: string;
  userAddress?: string;
}

export default function BookingConfirmation({ 
  bookingId, 
  spot, 
  signature,
  userAddress 
}: BookingConfirmationProps) {

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your parking spot has been successfully booked</p>
      </div>

      {/* QR Code */}
      <div className="mb-6">
        <QRCodeDisplay
          bookingId={bookingId}
          spotId={spot.id}
          spotLocation={spot.location}
          signature={signature}
          signerAddress={userAddress}
        />
      </div>

      {/* Booking Details */}
      <div className="border-t pt-6 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-medium break-all text-right ml-4">{bookingId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Spot Location:</span>
          <span className="font-medium text-right ml-4">{spot.location}</span>
        </div>
        {userAddress && (
             <div className="flex justify-between">
             <span className="text-gray-600">Booked By:</span>
             <span className="font-medium text-right ml-4 break-all text-xs">{userAddress}</span>
           </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => window.location.href = "/bookings"}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Booking History
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Save Receipt
        </button>
      </div>
    </div>
  );
}
