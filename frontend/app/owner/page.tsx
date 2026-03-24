"use client";

import { useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import OwnerDashboard from "@/components/owner/OwnerDashboard";

export default function OwnerPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Owner Dashboard</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-lg text-gray-600 mb-6">
              Please connect your wallet to access the owner dashboard
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
        <OwnerDashboard address={address!} />
      </div>
    </main>
  );
}




