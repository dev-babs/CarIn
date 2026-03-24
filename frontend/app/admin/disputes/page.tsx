'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import AdminDisputePanel from '@/components/disputes/AdminDisputePanel';
import { useReadContract } from 'wagmi';
import { DISPUTE_RESOLUTION_ABI, DISPUTE_RESOLUTION_ADDRESSES } from '@/lib/contracts/disputeResolution';
import { useChainId } from 'wagmi';

export default function AdminDisputesPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [disputeId, setDisputeId] = useState<string>('');
  const [selectedDisputeId, setSelectedDisputeId] = useState<bigint | null>(null);

  const contractAddress = chainId === 44787 
    ? DISPUTE_RESOLUTION_ADDRESSES.alfajores as `0x${string}`
    : DISPUTE_RESOLUTION_ADDRESSES.celo as `0x${string}`;

  // Check if user is moderator (would need to query contract)
  const { data: isModerator } = useReadContract({
    address: contractAddress,
    abi: DISPUTE_RESOLUTION_ABI,
    functionName: 'moderators',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress
    }
  }) as { data: boolean | undefined };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Wallet Not Connected</h2>
            <p className="text-yellow-700">Please connect your wallet to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isModerator === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-700">You are not authorized to access this admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Dispute Panel</h1>
          <p className="text-gray-600">Review and resolve disputes</p>
        </div>

        <div className="mb-6">
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Enter Dispute ID"
              value={disputeId}
              onChange={(e) => setDisputeId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => {
                if (disputeId) {
                  setSelectedDisputeId(BigInt(disputeId));
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Load Dispute
            </button>
          </div>
        </div>

        {selectedDisputeId && (
          <AdminDisputePanel disputeId={selectedDisputeId} />
        )}

        {!selectedDisputeId && (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-gray-600">Enter a dispute ID to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}




