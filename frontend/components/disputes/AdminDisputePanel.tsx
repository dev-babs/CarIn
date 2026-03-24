'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDisputeResolution, useDisputeDetails, useDisputeEvidence, useDisputeVotes } from '@/lib/hooks/useDisputeResolution';
import { ResolutionType } from '@/lib/contracts/disputeResolution';
import EvidenceDisplay from './EvidenceDisplay';
import { useWaitForTransactionReceipt } from 'wagmi';

interface AdminDisputePanelProps {
  disputeId: bigint;
}

export default function AdminDisputePanel({ disputeId }: AdminDisputePanelProps) {
  const { address } = useAccount();
  const { dispute, isLoading: loadingDispute } = useDisputeDetails(disputeId);
  const { evidence, isLoading: loadingEvidence } = useDisputeEvidence(disputeId);
  const { votes, isLoading: loadingVotes } = useDisputeVotes(disputeId);
  const { resolveDisputeManually, submitVote, hash } = useDisputeResolution();

  const [refundApproved, setRefundApproved] = useState(true);
  const [refundPercentage, setRefundPercentage] = useState(100);
  const [voteJustification, setVoteJustification] = useState('');
  const [resolving, setResolving] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleManualResolution = async () => {
    if (!dispute || resolving) return;
    setResolving(true);
    try {
      await resolveDisputeManually(disputeId, refundApproved, BigInt(refundPercentage));
    } catch (error) {
      console.error('Resolution error:', error);
      setResolving(false);
    }
  };

  const handleVote = async () => {
    if (!voteJustification.trim()) {
      alert('Please provide a justification for your vote');
      return;
    }
    try {
      await submitVote(disputeId, refundApproved, BigInt(refundPercentage), voteJustification);
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  if (loadingDispute || !dispute) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (dispute.isResolved) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dispute #{dispute.disputeId.toString()}</h2>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold">
            Status: Resolved
          </p>
          <p className="text-gray-700 mt-2">
            Refund: {dispute.refundApproved ? `${Number(dispute.refundPercentage)}% approved` : 'Denied'}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Resolved by: {dispute.resolvedBy.slice(0, 6)}...{dispute.resolvedBy.slice(-4)}
          </p>
        </div>
      </div>
    );
  }

  const isVotingPhase = dispute.resolutionType === ResolutionType.PendingVote;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dispute #{dispute.disputeId.toString()}</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Booking ID</p>
            <p className="text-lg font-semibold">{dispute.bookingId.toString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Escrow ID</p>
            <p className="text-lg font-semibold">{dispute.escrowId.toString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Reason</h3>
          <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">{dispute.reason}</p>
        </div>

        {evidence && evidence.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Evidence</h3>
            <div className="space-y-4">
              {evidence.map((ev) => (
                <EvidenceDisplay key={ev.evidenceId.toString()} evidence={ev} />
              ))}
            </div>
          </div>
        )}

        {isVotingPhase && votes && votes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Votes ({votes.length})</h3>
            <div className="space-y-2">
              {votes.map((vote, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{vote.voter.slice(0, 6)}...{vote.voter.slice(-4)}</p>
                      <p className="text-sm text-gray-600 mt-1">{vote.justification}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      vote.supportsRefund ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {vote.supportsRefund ? 'Refund' : 'Deny'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isVotingPhase ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit Vote</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={refundApproved}
                    onChange={(e) => setRefundApproved(e.target.checked)}
                    className="rounded"
                  />
                  <span>Support refund</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Percentage (if approved)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={refundPercentage}
                  onChange={(e) => setRefundPercentage(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification *
                </label>
                <textarea
                  value={voteJustification}
                  onChange={(e) => setVoteJustification(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Explain your vote..."
                />
              </div>
              <button
                onClick={handleVote}
                disabled={isConfirming || !voteJustification.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isConfirming ? 'Submitting...' : 'Submit Vote'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Manual Resolution</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={refundApproved}
                    onChange={(e) => setRefundApproved(e.target.checked)}
                    className="rounded"
                  />
                  <span>Approve refund</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Percentage (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={refundPercentage}
                  onChange={(e) => setRefundPercentage(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={handleManualResolution}
                disabled={resolving || isConfirming}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400"
              >
                {resolving || isConfirming ? 'Resolving...' : 'Resolve Dispute'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




