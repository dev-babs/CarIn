"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import WalletConnect from "@/components/WalletConnect";
import BookingFlow from "@/components/booking/BookingFlow";
import SpotDetails from "@/components/booking/SpotDetails";
import { BookingLoading } from "@/components/booking/LoadingStates";

export default function BookingPage() {
  const params = useParams();
  const spotId = params.spotId as string;
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [spot, setSpot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpotDetails();
  }, [spotId]);

  const fetchSpotDetails = async () => {
    setLoading(true);
    try {
      // TODO: Fetch spot details from smart contract
      const mockSpot = {
        id: spotId,
        location: "123 Main St, San Francisco, CA",
        pricePerHour: "2.50",
        images: ["QmExample1", "QmExample2"],
        description: "Convenient street parking near downtown",
        owner: "0x123...",
        isAvailable: true,
      };
      setSpot(mockSpot);
    } catch (error) {
      console.error("Error fetching spot:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <BookingLoading />
        </div>
      </main>
    );
  }

  if (error || !spot) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-2">Error loading spot</p>
            <p className="text-sm text-gray-500">{error || "Spot not found"}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <SpotDetails spot={spot} />
          <div className="mt-8 bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-600 mb-6">
              Please connect your wallet to book this parking spot
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
    <BookingErrorBoundary>
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <SpotDetails spot={spot} />
          <BookingFlow spot={spot} userAddress={address!} />
        </div>
      </main>
    </BookingErrorBoundary>
  );
}
