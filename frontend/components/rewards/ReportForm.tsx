"use client";

import { useState } from "react";
import { useRewardReports } from "@/lib/hooks/useRewards";
import { useAccount } from "wagmi";

interface ReportFormProps {
  spotId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReportForm({ spotId, onSuccess, onCancel }: ReportFormProps) {
  const { address, isConnected } = useAccount();
  const { submitReport, loading } = useRewardReports();
  const [reason, setReason] = useState("");
  const [evidenceHash, setEvidenceHash] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for the report");
      return;
    }

    if (!evidenceHash.trim()) {
      setError("Please provide evidence (IPFS hash or URL)");
      return;
    }

    try {
      setError(null);
      await submitReport(spotId, reason, evidenceHash);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Please connect your wallet to submit a report
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="spotId" className="block text-sm font-medium text-gray-700 mb-1">
          Spot ID
        </label>
        <input
          type="number"
          id="spotId"
          value={spotId}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Report *
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={4}
          placeholder="Describe the inaccuracy (e.g., wrong location, spot doesn't exist, misleading information...)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="evidenceHash" className="block text-sm font-medium text-gray-700 mb-1">
          Evidence (IPFS Hash or URL) *
        </label>
        <input
          type="text"
          id="evidenceHash"
          value={evidenceHash}
          onChange={(e) => setEvidenceHash(e.target.value)}
          required
          placeholder="ipfs://Qm... or https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Upload evidence to IPFS and provide the hash, or provide a URL to evidence
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600">
        * After submission, your report will be reviewed. If validated, you will receive {300} CARIN tokens as a reward.
      </p>
    </form>
  );
}




