'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDisputeResolution } from '@/lib/hooks/useDisputeResolution';
import { EvidenceType, uploadEvidenceToIPFS, ipfsHashToBytes, validateEvidence, formatEvidenceType } from '@/lib/utils/evidenceHandler';
import { useWaitForTransactionReceipt } from 'wagmi';

interface FileDisputeFormProps {
  escrowId: bigint;
  bookingId: bigint;
  onSuccess?: (disputeId: bigint) => void;
  onCancel?: () => void;
}

export default function FileDisputeForm({ escrowId, bookingId, onSuccess, onCancel }: FileDisputeFormProps) {
  const { address } = useAccount();
  const { fileDispute, hash, isPending } = useDisputeResolution();
  const [reason, setReason] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>(EvidenceType.Other);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateEvidence(evidenceType, file, evidenceDescription);
      if (!validation.valid) {
        setError(validation.error || 'Invalid evidence');
        return;
      }
      setEvidenceFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the dispute');
      return;
    }

    try {
      let evidenceHash: `0x${string}` = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

      // Upload evidence if file provided
      if (evidenceFile) {
        setUploading(true);
        const ipfsHash = await uploadEvidenceToIPFS(evidenceFile, evidenceType);
        evidenceHash = ipfsHashToBytes(ipfsHash) as `0x${string}`;
        setUploading(false);
      } else if (evidenceType === EvidenceType.CheckInTimestamp || evidenceType === EvidenceType.CheckOutTimestamp) {
        // For timestamp evidence, use current timestamp
        evidenceHash = '0x' + BigInt(Math.floor(Date.now() / 1000)).toString(16).padStart(64, '0') as `0x${string}`;
      }

      await fileDispute(escrowId, bookingId, reason, evidenceHash, evidenceType);
    } catch (err: any) {
      setError(err.message || 'Failed to file dispute');
      setUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Dispute Filed Successfully</h3>
        <p className="text-green-700">Your dispute has been filed and is being reviewed.</p>
        {onSuccess && <button onClick={() => onSuccess(BigInt(0))} className="mt-4 text-green-600 underline">View Dispute</button>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">File a Dispute</h2>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Dispute <span className="text-red-500">*</span>
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the issue with this booking..."
          required
        />
      </div>

      <div>
        <label htmlFor="evidenceType" className="block text-sm font-medium text-gray-700 mb-2">
          Evidence Type
        </label>
        <select
          id="evidenceType"
          value={evidenceType}
          onChange={(e) => setEvidenceType(Number(e.target.value) as EvidenceType)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.values(EvidenceType)
            .filter((v) => !isNaN(Number(v)))
            .map((type) => (
              <option key={type} value={type}>
                {formatEvidenceType(Number(type) as EvidenceType)}
              </option>
            ))}
        </select>
      </div>

      {(evidenceType === EvidenceType.Image || 
        evidenceType === EvidenceType.Video || 
        evidenceType === EvidenceType.Document) && (
        <div>
          <label htmlFor="evidenceFile" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Evidence
          </label>
          <input
            id="evidenceFile"
            type="file"
            onChange={handleFileChange}
            accept={
              evidenceType === EvidenceType.Image
                ? 'image/*'
                : evidenceType === EvidenceType.Video
                ? 'video/*'
                : 'application/pdf,application/msword,.doc,.docx'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {evidenceFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {evidenceFile.name} ({(evidenceFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="evidenceDescription" className="block text-sm font-medium text-gray-700 mb-2">
          Evidence Description
        </label>
        <textarea
          id="evidenceDescription"
          value={evidenceDescription}
          onChange={(e) => setEvidenceDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe what this evidence shows..."
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending || isConfirming || uploading || !address}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {uploading
            ? 'Uploading Evidence...'
            : isPending || isConfirming
            ? 'Filing Dispute...'
            : 'File Dispute'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}




