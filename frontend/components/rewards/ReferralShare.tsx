"use client";

import { useState } from "react";
import { useReferrals } from "@/lib/hooks/useRewards";
import { useAccount } from "wagmi";

interface ReferralShareProps {
  spotId: number;
}

export default function ReferralShare({ spotId }: ReferralShareProps) {
  const { address, isConnected } = useAccount();
  const { createReferral, loading } = useReferrals();
  const [refereeAddress, setRefereeAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    if (!refereeAddress.trim()) {
      setError("Please enter a referee address");
      return;
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(refereeAddress)) {
      setError("Invalid Ethereum address format");
      return;
    }

    if (refereeAddress.toLowerCase() === address?.toLowerCase()) {
      setError("Cannot refer yourself");
      return;
    }

    try {
      setError(null);
      await createReferral(refereeAddress, spotId);
      setSuccess(true);
      setRefereeAddress("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create referral");
    }
  };

  const generateReferralLink = () => {
    if (!address) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/booking/${spotId}?ref=${address}`;
  };

  const copyReferralLink = () => {
    const link = generateReferralLink();
    navigator.clipboard.writeText(link);
    alert("Referral link copied to clipboard!");
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Please connect your wallet to share s
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Share Spot & Earn Rewards</h3>
        <p className="text-sm text-gray-600 mb-4">
          Share this spot with friends and earn {25} CARIN tokens when they make a booking!
        </p>
      </div>

      {/* Referral Link */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Referral Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={generateReferralLink()}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          />
          <button
            onClick={copyReferralLink}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Copy
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Share this link with friends. When they book using this link, you&apos;ll earn rewards!
        </p>
      </div>

      {/* Manual Referral Form */}
      <form onSubmit={handleCreateReferral} className="space-y-4">
        <div>
          <label htmlFor="refereeAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Or Enter Referee Address
          </label>
          <input
            type="text"
            id="refereeAddress"
            value={refereeAddress}
            onChange={(e) => setRefereeAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Referral created successfully! You&apos;ll earn rewards when they book.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Referral..." : "Create Referral"}
        </button>
      </form>
    </div>
  );
}




