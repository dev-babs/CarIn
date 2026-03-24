'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import DisputeCard from './DisputeCard';
import { DisputeDetails } from '@/lib/contracts/disputeResolution';
import { useReadContract } from 'wagmi';
import { DISPUTE_RESOLUTION_ABI, DISPUTE_RESOLUTION_ADDRESSES } from '@/lib/contracts/disputeResolution';
import { useChainId } from 'wagmi';

interface DisputeHistoryProps {
  escrowIds?: bigint[];
}

export default function DisputeHistory({ escrowIds }: DisputeHistoryProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const [disputes, setDisputes] = useState<DisputeDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputeDetails | null>(null);

  const contractAddress = chainId === 44787 
    ? DISPUTE_RESOLUTION_ADDRESSES.alfajores as `0x${string}`
    : DISPUTE_RESOLUTION_ADDRESSES.celo as `0x${string}`;

  useEffect(() => {
    const loadDisputes = async () => {
      if (!address || !contractAddress) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // TODO: Implement proper dispute fetching from events or indexed data
        // For now, this is a placeholder that would need backend/indexer support
        const loadedDisputes: DisputeDetails[] = [];
        setDisputes(loadedDisputes);
      } catch (error) {
        console.error('Error loading disputes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDisputes();
  }, [address, contractAddress]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dispute History</h2>
        <div className="text-center py-12">
          <p className="text-gray-600">No disputes found</p>
          <p className="text-sm text-gray-500 mt-2">
            Disputes you file or are involved in will appear here
          </p>
        </div>
      </div>
    );
  }

  const activeDisputes = disputes.filter((d) => !d.isResolved);
  const resolvedDisputes = disputes.filter((d) => d.isResolved);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dispute History</h2>
        <div className="text-sm text-gray-600">
          {activeDisputes.length} active, {resolvedDisputes.length} resolved
        </div>
      </div>

      {activeDisputes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Disputes</h3>
          <div className="space-y-4">
            {activeDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.disputeId.toString()}
                dispute={dispute}
                onClick={() => setSelectedDispute(dispute)}
              />
            ))}
          </div>
        </div>
      )}

      {resolvedDisputes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Resolved Disputes</h3>
          <div className="space-y-4">
            {resolvedDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.disputeId.toString()}
                dispute={dispute}
                onClick={() => setSelectedDispute(dispute)}
              />
            ))}
          </div>
        </div>
      )}

      {selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Dispute Details</h3>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {/* Dispute details view would go here */}
            <DisputeCard dispute={selectedDispute} />
          </div>
        </div>
      )}
    </div>
  );
}




