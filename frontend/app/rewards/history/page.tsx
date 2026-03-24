"use client";

import { useAccount } from "wagmi";
import WalletConnect from "@/components/WalletConnect";
import RewardHistory from "@/components/rewards/RewardHistory";

export default function RewardHistoryPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Reward History</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Please connect your wallet to view your reward history</p>
            <WalletConnect />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Reward History</h1>
        <RewardHistory />
      </div>
    </div>
  );
}




