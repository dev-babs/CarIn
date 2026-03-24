"use client";

import { useState, useEffect } from "react";
import WalletConnect from "@/components/WalletConnect";
import BookingHistory from "@/components/booking/BookingHistory";

export default function BookingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Booking History</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-600 mb-6">
              Please connect your wallet to view your booking history
            </p>
            <WalletConnect
              onConnect={(addr) => {
                setAddress(addr);
                setIsConnected(true);
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Booking History</h1>
        <BookingHistory userAddress={address!} />
      </div>
    </main>
  );
}




