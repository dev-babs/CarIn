'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import DisputeHistory from '@/components/disputes/DisputeHistory';
import FileDisputeForm from '@/components/disputes/FileDisputeForm';
import { useReadContract } from 'wagmi';
import { PAYMENT_ESCROW_ABI, PAYMENT_ESCROW_ADDRESSES } from '@/lib/contracts/paymentEscrow';
import { useChainId } from 'wagmi';

export default function DisputesPage() {
  const { address, isConnected } = useAccount();
  const [showFileForm, setShowFileForm] = useState(false);
  const [selectedEscrowId, setSelectedEscrowId] = useState<bigint | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<bigint | null>(null);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Wallet Not Connected</h2>
            <p className="text-yellow-700">Please connect your wallet to view and file disputes.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dispute Resolution</h1>
          <button
            onClick={() => setShowFileForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            File New Dispute
          </button>
        </div>

        {showFileForm && (
          <div className="mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escrow ID
              </label>
              <input
                type="number"
                placeholder="Enter escrow ID"
                onChange={(e) => setSelectedEscrowId(e.target.value ? BigInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID
              </label>
              <input
                type="number"
                placeholder="Enter booking ID"
                onChange={(e) => setSelectedBookingId(e.target.value ? BigInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            {selectedEscrowId && selectedBookingId && (
              <FileDisputeForm
                escrowId={selectedEscrowId}
                bookingId={selectedBookingId}
                onSuccess={() => {
                  setShowFileForm(false);
                  setSelectedEscrowId(null);
                  setSelectedBookingId(null);
                }}
                onCancel={() => {
                  setShowFileForm(false);
                  setSelectedEscrowId(null);
                  setSelectedBookingId(null);
                }}
              />
            )}
          </div>
        )}

        <DisputeHistory />
      </div>
    </div>
  );
}




